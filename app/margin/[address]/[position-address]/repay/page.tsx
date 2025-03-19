'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Address, parseUnits, formatUnits, zeroAddress, maxUint256 } from 'viem';
import { useAccount } from 'wagmi';
import { Button } from '@/components/shared/Button';
import { ArrowLeft, Info, WalletIcon, AlertTriangle } from 'lucide-react';
import { usePosition } from '@/hooks/usePosition';
import { useLendingPool } from '@/hooks/useLendingPool';
import { useLendingPoolFactory } from '@/hooks/useLendingPoolFactory';
import { formatTokenAmount } from '@/lib/utils/format';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { erc20Abi } from 'viem';
import { toast } from 'sonner';
import { positionABI } from '@/lib/abis/position';

export default function RepayPositionPage() {
    const router = useRouter();
    const params = useParams();
    const poolAddress = params.address as Address;
    const positionAddress = params["position-address"] as Address;
    const { address: userAddress } = useAccount();

    // Client-side detection
    const [isClient, setIsClient] = useState(false);

    // State management
    const [repayAmount, setRepayAmount] = useState('');
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
    const [needsApproval, setNeedsApproval] = useState(true);

    // Fix for hydration mismatch
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Get pool data
    const { poolAddresses, pools } = useLendingPoolFactory();
    const poolIndex = poolAddresses.findIndex(addr => addr.toLowerCase() === poolAddress.toLowerCase());
    const pool = poolIndex !== -1 ? pools[poolIndex] : undefined;

    // Get position data
    const { 
        baseCollateral,
        effectiveCollateral,
        borrowShares,
        leverage,
        liquidationPrice,
        health,
        ltv,
        isLoading: isLoadingPosition,
        error: positionError
    } = usePosition(positionAddress);

    // Get lending pool data
    const { totalBorrowShares, totalBorrowAssets } = useLendingPool(poolAddress);

    // Contract functions
    const { writeContract, isPending: isWritePending } = useWriteContract();
    
    // Transaction confirmation
    const { isLoading: isConfirming, data: receipt } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    // Get token balance
    const { data: walletBalance, refetch: refetchBalance } = useReadContract({
        address: pool?.loanToken,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [userAddress || zeroAddress],
    });

    // Get token allowance for position contract
    const { data: walletAllowance, refetch: refetchAllowance } = useReadContract({
        address: pool?.loanToken,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [userAddress || zeroAddress, positionAddress],
    });

    // Refresh data on page load
    useEffect(() => {
        if (isClient && userAddress) {
            refetchBalance();
            refetchAllowance();
        }
    }, [isClient, userAddress, refetchBalance, refetchAllowance]);

    // Check if approval is needed
    useEffect(() => {
        if (!isClient || !walletAllowance || !pool?.loanToken || !repayAmount) {
            return;
        }
        
        try {
            if (repayAmount === '') {
                setNeedsApproval(false);
                return;
            }
            
            const amountBigInt = parseUnits(repayAmount, 18);
            
            if (walletAllowance < amountBigInt) {
                setNeedsApproval(true);
            } else {
                setNeedsApproval(false);
            }
        } catch (error) {
            console.error('Error checking allowance:', error);
        }
    }, [walletAllowance, pool?.loanToken, repayAmount, isClient]);

    // Watch for transaction completion
    useEffect(() => {
        if (!receipt) return;

        if (receipt.status === 'success') {
            toast.dismiss('tx-confirm');
            
            if (needsApproval) {
                toast.success('Token approved successfully!');
                refetchAllowance().then(() => {
                    setNeedsApproval(false);
                    setTxHash(undefined);
                });
            } else {
                toast.success('Debt repaid successfully!');
                setTimeout(() => {
                    router.push(`/margin/${poolAddress}/${positionAddress}`);
                }, 1000);
            }
        } else {
            toast.dismiss('tx-confirm');
            toast.error('Transaction failed');
        }
    }, [receipt, router, needsApproval, refetchAllowance, poolAddress, positionAddress]);

    // Convert borrowShares to actual borrowed amount
    const calculateBorrowedAmount = () => {
        if (!borrowShares || !totalBorrowShares || !totalBorrowAssets || totalBorrowShares === 0n) {
            return 0n;
        }

        // Convert shares to assets: (shares * totalAssets) / totalShares
        return (borrowShares * totalBorrowAssets) / totalBorrowShares;
    };

    // Get actual borrowed amount
    const borrowedAmount = calculateBorrowedAmount();
    const borrowedAmountFormatted = formatTokenAmount(borrowedAmount);

    // Calculate how this affects health factor and LTV
    const calculateUpdatedMetrics = () => {
        if (!repayAmount || !health || !borrowedAmount || !effectiveCollateral || borrowedAmount === 0n) {
            return {
                newHealth: Number(health) / 100 || 0,
                newLtv: Number(ltv) / 10000 || 0,
                healthImprovement: 0,
                ltvReduction: 0
            };
        }

        try {
            // Current values
            const currentEffectiveCollateral = Number(formatUnits(effectiveCollateral, 18));
            const currentBorrowAmount = Number(formatUnits(borrowedAmount, 18));
            
            // Repay amount in decimal
            const repayAmountDecimal = Math.min(parseFloat(repayAmount), currentBorrowAmount);
            
            // New borrow amount after repayment
            const newBorrowAmount = currentBorrowAmount - repayAmountDecimal;
            
            // Calculate new health and LTV
            const currentHealth = Number(health) / 100;
            const currentLtv = Number(ltv) / 10000;
            
            // Simple calculation (proportional)
            const newHealth = newBorrowAmount === 0 
                ? 999 // Practically infinite health if no debt
                : currentHealth * (currentBorrowAmount / newBorrowAmount);
                
            const newLtv = newBorrowAmount === 0 
                ? 0 // No LTV if no debt
                : currentLtv * (newBorrowAmount / currentBorrowAmount);
            
            return {
                newHealth: newHealth,
                newLtv: newLtv,
                healthImprovement: newHealth - currentHealth,
                ltvReduction: currentLtv - newLtv
            };
        } catch (error) {
            console.error('Error calculating updated metrics:', error);
            return {
                newHealth: Number(health) / 100 || 0,
                newLtv: Number(ltv) / 10000 || 0,
                healthImprovement: 0,
                ltvReduction: 0
            };
        }
    };

    const updatedMetrics = calculateUpdatedMetrics();

    // Handle percentage buttons
    const handlePercentageClick = (percentage: number) => {
        if (!borrowedAmount) return;
        
        // Calculate what percentage of the debt to repay
        const amount = (Number(formatUnits(borrowedAmount, 18)) * percentage) / 100;
        setRepayAmount(amount.toFixed(6)); // Limit to 6 decimal places for better UX
    };

    // Input validation
    const isExceedingBalance = () => {
        if (!walletBalance || !repayAmount) return false;
        try {
            const amount = parseUnits(repayAmount, 18);
            return amount > walletBalance;
        } catch {
            return false;
        }
    };

    const isExceedingDebt = () => {
        if (!borrowedAmount || !repayAmount) return false;
        try {
            const amount = parseUnits(repayAmount, 18);
            return amount > borrowedAmount;
        } catch {
            return false;
        }
    };

    // Approve loan tokens
    const handleApproveTokens = async () => {
        if (!isClient || !pool || !userAddress) return;

        try {
            toast.loading('Approving token...', { id: 'approve-tx' });

            writeContract({
                address: pool.loanToken,
                abi: erc20Abi,
                functionName: 'approve',
                args: [positionAddress, maxUint256],
            }, {
                onSuccess: (hash) => {
                    console.log('Token approval transaction hash:', hash);
                    setTxHash(hash);
                    toast.dismiss('approve-tx');
                    toast.loading('Approval transaction submitted...', { id: 'tx-confirm' });
                },
                onError: (error) => {
                    console.error('Token approval error:', error);
                    toast.dismiss('approve-tx');
                    toast.error('Failed to approve token: ' + error.message);
                }
            });
        } catch (error) {
            console.error('Token approval error:', error);
            toast.dismiss('approve-tx');
            toast.error('Failed to approve token');
        }
    };

    // Repay borrowed debt
    const handleRepay = async () => {
        if (!isClient || !repayAmount || Number(repayAmount) <= 0) return;

        try {
            // Convert repay amount to shares
            if (!borrowShares || !totalBorrowShares || !totalBorrowAssets || totalBorrowAssets === 0n || borrowedAmount === 0n) {
                toast.error('Cannot calculate repayment shares - invalid data');
                return;
            }

            const repayAmountBigInt = parseUnits(repayAmount, 18);
            
            // If trying to repay more than the debt, just repay the whole debt
            const actualRepayAmount = repayAmountBigInt > borrowedAmount ? borrowedAmount : repayAmountBigInt;
            
            // Calculate shares to repay: (amount * totalShares) / totalAssets
            const sharesToRepay = (actualRepayAmount * totalBorrowShares) / totalBorrowAssets;
            
            toast.loading('Repaying debt...', { id: 'repay-debt' });

            writeContract({
                address: positionAddress,
                abi: positionABI,
                functionName: 'repay',
                args: [sharesToRepay],
            }, {
                onSuccess: (hash) => {
                    console.log('Repay debt transaction hash:', hash);
                    setTxHash(hash);
                    toast.dismiss('repay-debt');
                    toast.loading('Transaction submitted, waiting for confirmation...', { id: 'tx-confirm' });
                },
                onError: (error) => {
                    console.error('Repay debt error:', error);
                    toast.dismiss('repay-debt');
                    toast.error('Failed to repay debt: ' + error.message);
                }
            });
        } catch (error) {
            console.error('Error repaying debt:', error);
            toast.dismiss('repay-debt');
            toast.error('Failed to repay debt');
        }
    };

    // Get appropriate button state and label
    const getButtonConfig = () => {
        const isPending = isWritePending || isConfirming;
        
        if (needsApproval) {
            return {
                label: isPending ? 'Approving...' : `Approve ${pool?.loanTokenSymbol}`,
                disabled: !repayAmount || isPending || isExceedingBalance() || Number(repayAmount) <= 0,
                handler: handleApproveTokens
            };
        }
        
        return {
            label: isPending ? 'Repaying Debt...' : 'Repay Debt',
            disabled: !repayAmount || isPending || isExceedingBalance() || Number(repayAmount) <= 0,
            handler: handleRepay
        };
    };

    const buttonConfig = getButtonConfig();

    // Loading states
    if (!isClient || (isLoadingPosition && !positionError)) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Button
                    variant="ghost"
                    className="mb-6"
                    onClick={() => router.push(`/margin/${poolAddress}/${positionAddress}`)}
                >
                    <ArrowLeft className="size-4 mr-2" />
                    Back
                </Button>
                
                <div className="max-w-xl mx-auto">
                    <div className="bg-card rounded-lg border p-6">
                        <div className="text-center py-8">
                            <div className="size-8 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Loading position data...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error states
    if (positionError) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Button
                    variant="ghost"
                    className="mb-6"
                    onClick={() => router.push(`/margin/${poolAddress}/${positionAddress}`)}
                >
                    <ArrowLeft className="size-4 mr-2" />
                    Back
                </Button>
                
                <div className="max-w-xl mx-auto">
                    <div className="bg-card rounded-lg border p-6">
                        <div className="text-center py-8">
                            <AlertTriangle className="size-10 text-destructive mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">Error Loading Position</h3>
                            <p className="text-muted-foreground mb-6">{positionError || 'Failed to load position data'}</p>
                            <Button onClick={() => router.push(`/margin/${poolAddress}/${positionAddress}`)}>Go Back</Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <main className="container mx-auto px-4 py-8">
            <Button
                variant="ghost"
                className="mb-6"
                onClick={() => router.push(`/margin/${poolAddress}/${positionAddress}`)}
            >
                <ArrowLeft className="size-4 mr-2" />
                Back to Position
            </Button>

            <div className="max-w-xl mx-auto">
                <div className="bg-card rounded-lg border p-6 space-y-6">
                    <div>
                        <h1 className="text-xl font-bold mb-2">Repay Debt</h1>
                        <p className="text-sm text-muted-foreground">
                            Repay borrowed {pool?.loanTokenSymbol} for your {pool?.loanTokenSymbol}/{pool?.collateralTokenSymbol} position
                        </p>
                    </div>

                    {/* Current Position Summary */}
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Current Borrowed Amount</span>
                            <span>{borrowedAmountFormatted} {pool?.loanTokenSymbol}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Current Health Factor</span>
                            <span className={`${Number(health) / 100 < 1.1 ? 'text-red-500' : Number(health) / 100 < 1.3 ? 'text-yellow-500' : 'text-green-500'}`}>
                                {(Number(health) / 100).toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Current LTV</span>
                            <span>{(Number(ltv) / 10000).toFixed(4)}</span>
                        </div>
                    </div>

                    {/* Repay Input */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-medium">Repay Amount</h2>
                            <div className="text-sm text-muted-foreground">
                                Balance: {formatTokenAmount(walletBalance || 0n)} {pool?.loanTokenSymbol}
                            </div>
                        </div>

                        <div className="relative">
                            <input
                                type="number"
                                value={repayAmount}
                                onChange={(e) => setRepayAmount(e.target.value)}
                                className="w-full bg-background p-3 rounded border"
                                placeholder="0.00"
                                disabled={isWritePending || isConfirming}
                                step="0.000001"
                                min="0"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <span className="text-sm font-medium">{pool?.loanTokenSymbol}</span>
                            </div>
                        </div>

                        {isExceedingBalance() && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                                <Info className="size-4" />
                                Insufficient balance
                            </p>
                        )}

                        {isExceedingDebt() && (
                            <p className="text-sm text-yellow-500 flex items-center gap-1">
                                <Info className="size-4" />
                                Amount exceeds current debt (will repay full amount)
                            </p>
                        )}

                        <div className="flex gap-2">
                            {[25, 50, 75, 100].map((percentage) => (
                                <Button
                                    key={percentage}
                                    variant="outline"
                                    onClick={() => handlePercentageClick(percentage)}
                                    className="flex-1"
                                    disabled={isWritePending || isConfirming || !isClient || !borrowedAmount || borrowedAmount === 0n}
                                >
                                    {percentage}%
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Updated Position Summary */}
                    {isClient && repayAmount && Number(repayAmount) > 0 && (
                        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Remaining Debt</span>
                                <span>
                                    {parseFloat(repayAmount) >= Number(formatUnits(borrowedAmount || 0n, 18))
                                        ? '0.00'
                                        : (Number(formatUnits(borrowedAmount || 0n, 18)) - parseFloat(repayAmount)).toFixed(4)
                                    } {pool?.loanTokenSymbol}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">New Health Factor</span>
                                <span className={`${updatedMetrics.newHealth < 1.1 ? 'text-red-500' : updatedMetrics.newHealth < 1.3 ? 'text-yellow-500' : 'text-green-500'}`}>
                                    {updatedMetrics.newHealth > 900 ? '∞' : updatedMetrics.newHealth.toFixed(2)} 
                                    {updatedMetrics.healthImprovement > 0 && (
                                        <span className="text-green-500 ml-1">(+{updatedMetrics.healthImprovement.toFixed(2)})</span>
                                    )}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">New LTV</span>
                                <span>
                                    {updatedMetrics.newLtv.toFixed(4)} 
                                    {updatedMetrics.ltvReduction > 0 && (
                                        <span className="text-green-500 ml-1">(-{updatedMetrics.ltvReduction.toFixed(4)})</span>
                                    )}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Info message */}
                    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                            <Info className="size-4 text-blue-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-blue-700 dark:text-blue-300 text-sm">
                                    Repaying your borrowed amount will improve your position&apos;s health factor and reduce liquidation risk.
                                    You can repay any amount of your debt at any time.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    {isClient && (
                        <Button
                            className="w-full"
                            size="lg"
                            onClick={buttonConfig.handler}
                            disabled={buttonConfig.disabled}
                        >
                            {buttonConfig.label}
                        </Button>
                    )}

                    {/* Transaction status */}
                    {isClient && txHash && (
                        <div className="text-center text-sm text-muted-foreground">
                            <p className="mb-1">Transaction submitted</p>
                            <a 
                                href={`https://sepolia.arbiscan.io/tx/${txHash}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline inline-flex items-center gap-1"
                            >
                                View on explorer
                                <Info className="size-3" />
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}