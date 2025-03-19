'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Address, parseUnits, formatUnits, zeroAddress, maxUint256 } from 'viem';
import { useAccount } from 'wagmi';
import { Button } from '@/components/shared/Button';
import { ArrowLeft, Info, AlertTriangle, ArrowDownCircle } from 'lucide-react';
import { usePosition } from '@/hooks/usePosition';
import { useLendingPool } from '@/hooks/useLendingPool';
import { useLendingPoolFactory } from '@/hooks/useLendingPoolFactory';
import { formatTokenAmount } from '@/lib/utils/format';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { erc20Abi } from 'viem';
import { toast } from 'sonner';
import { formatAddress } from '@/lib/utils';
import { positionABI } from '@/lib/abis/position';

export default function AddCollateralPage() {
    const router = useRouter();
    const params = useParams();
    const poolAddress = params.address as Address;
    const positionAddress = params["position-address"] as Address;
    const { address: userAddress } = useAccount();

    // Client-side detection
    const [isClient, setIsClient] = useState(false);

    // State management
    const [collateralAmount, setCollateralAmount] = useState('');
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
        isLoading: isLoadingPosition,
        error: positionError,
        refresh: refreshPosition
    } = usePosition(positionAddress);

    // Get lending pool data for calculations
    const { ltp } = useLendingPool(poolAddress);

    // Contract functions
    const { writeContract, isPending: isWritePending } = useWriteContract();
    
    // Transaction confirmation
    const { isLoading: isConfirming, data: receipt } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    // Get token balance
    const { data: walletBalance, refetch: refetchBalance } = useReadContract({
        address: pool?.collateralToken,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [userAddress || zeroAddress],
    });

    // Get token allowance for position contract
    const { data: walletAllowance, refetch: refetchAllowance } = useReadContract({
        address: pool?.collateralToken,
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
        if (!isClient || !walletAllowance || !pool?.collateralToken || !collateralAmount) {
            return;
        }
        
        try {
            if (collateralAmount === '') {
                setNeedsApproval(false);
                return;
            }
            
            const amountBigInt = parseUnits(collateralAmount, 18);
            
            if (walletAllowance < amountBigInt) {
                setNeedsApproval(true);
            } else {
                setNeedsApproval(false);
            }
        } catch (error) {
            console.error('Error checking allowance:', error);
        }
    }, [walletAllowance, pool?.collateralToken, collateralAmount, isClient]);

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
                toast.success('Collateral added successfully!');
                refreshPosition();
                // Redirect to position page
                setTimeout(() => {
                    router.push(`/margin/${poolAddress}/${positionAddress}`);
                }, 1000);
            }
        } else if (receipt.status === 'reverted') {
            toast.dismiss('tx-confirm');
            toast.error('Transaction failed: The contract reverted the operation');
        }
    }, [
        receipt,
        router,
        poolAddress,
        positionAddress,
        needsApproval,
        refetchAllowance,
        refreshPosition
    ]);

    // Calculate how this affects health factor and liquidation price
    const calculateUpdatedMetrics = () => {
        // Just return the current values
        return {
            newHealth: Number(health) / 100 || 0,
            newLiquidationPrice: Number(liquidationPrice) || 0,
            healthImprovement: 0,
            liquidationPriceReduction: 0
        };
    };

    const updatedMetrics = calculateUpdatedMetrics();

    // Handle percentage buttons
    const handlePercentageClick = (percentage: number) => {
        if (!walletBalance) return;
        const amount = (Number(formatUnits(walletBalance, 18)) * percentage) / 100;
        setCollateralAmount(amount.toString());
    };

    // Input validation
    const isExceedingBalance = () => {
        if (!walletBalance || !collateralAmount) return false;
        try {
            const amount = parseUnits(collateralAmount, 18);
            return amount > walletBalance;
        } catch {
            return false;
        }
    };

    // Approve collateral tokens
    const handleApproveTokens = async () => {
        if (!isClient || !pool || !userAddress) return;

        try {
            toast.loading('Approving collateral token...', { id: 'approve-tx' });

            writeContract({
                address: pool.collateralToken,
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

    // Add collateral
    const handleAddCollateral = async () => {
        if (!isClient || !collateralAmount || Number(collateralAmount) <= 0) return;

        try {
            const collateralAmountBigInt = parseUnits(collateralAmount, 18);
            
            toast.loading('Adding collateral...', { id: 'add-collateral' });

            writeContract({
                address: positionAddress,
                abi: positionABI,
                functionName: 'addCollateral',
                args: [collateralAmountBigInt],
            }, {
                onSuccess: (hash) => {
                    console.log('Add collateral transaction hash:', hash);
                    setTxHash(hash);
                    toast.dismiss('add-collateral');
                    toast.loading('Transaction submitted, waiting for confirmation...', { id: 'tx-confirm' });
                },
                onError: (error) => {
                    console.error('Add collateral error:', error);
                    toast.dismiss('add-collateral');
                    toast.error('Failed to add collateral: ' + error.message);
                }
            });
        } catch (error) {
            console.error('Error adding collateral:', error);
            toast.dismiss('add-collateral');
            toast.error('Failed to add collateral');
        }
    };

    // Action button state
    const isDisabled = isWritePending || isConfirming;
    const buttonLabel = needsApproval 
        ? (isDisabled ? 'Approving...' : `Approve ${pool?.collateralTokenSymbol}`) 
        : (isDisabled ? 'Adding Collateral...' : 'Add Collateral');

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
                        <ArrowDownCircle className="size-10 text-primary mx-auto mb-4" />
                        <h1 className="text-xl font-bold mb-2 text-center">Add Collateral</h1>
                        <p className="text-sm text-muted-foreground text-center">
                            Add collateral to your {pool?.loanTokenSymbol}/{pool?.collateralTokenSymbol} position
                        </p>
                    </div>

                    {/* Current Position Summary */}
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Position</span>
                            <span className="font-mono text-sm">{formatAddress(positionAddress)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Current Base Collateral</span>
                            <span>{(Number(formatUnits(baseCollateral || 0n, 18))).toLocaleString(undefined, { 
                                minimumFractionDigits: 2, 
                                maximumFractionDigits: 4 
                            })} {pool?.collateralTokenSymbol}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Current Health Factor</span>
                            <span className={`${Number(health) / 100 < 1.1 ? 'text-red-500 dark:text-red-400' : Number(health) / 100 < 1.3 ? 'text-yellow-500 dark:text-yellow-400' : 'text-green-500 dark:text-green-400'}`}>
                                {(Number(health) / 100).toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Current Liquidation Price</span>
                            <span>${(Number(formatUnits(liquidationPrice || 0n, 18))).toLocaleString(undefined, { 
                                minimumFractionDigits: 2, 
                                maximumFractionDigits: 2 
                            })}</span>

                        </div>
                    </div>

                    {/* Collateral Input */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-medium">Collateral Amount</h2>
                            <div className="text-sm text-muted-foreground">
                            Balance: {(Number(formatUnits(walletBalance || 0n, 18))).toLocaleString(undefined, { 
                                minimumFractionDigits: 2, 
                                maximumFractionDigits: 4 
                            })} {pool?.collateralTokenSymbol}
                            </div>
                        </div>

                        <div className="relative">
                            <input
                                type="number"
                                value={collateralAmount}
                                onChange={(e) => setCollateralAmount(e.target.value)}
                                className="w-full bg-background p-3 rounded border"
                                placeholder="0.00"
                                disabled={isWritePending || isConfirming}
                                step="0.000001"
                                min="0"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <span className="text-sm font-medium">{pool?.collateralTokenSymbol}</span>
                            </div>
                        </div>

                        {isExceedingBalance() && (
                            <p className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
                                <Info className="size-4" />
                                Insufficient balance
                            </p>
                        )}

                        <div className="flex gap-2">
                            {[25, 50, 75, 100].map((percentage) => (
                                <Button
                                    key={percentage}
                                    variant="outline"
                                    onClick={() => handlePercentageClick(percentage)}
                                    className="flex-1"
                                    disabled={isWritePending || isConfirming || !isClient || !walletBalance || walletBalance === 0n}
                                >
                                    {percentage}%
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Updated Position Stats (showing same values as current) */}
                    {isClient && collateralAmount && Number(collateralAmount) > 0 && (
                        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">New Base Collateral</span>
                                <span>{(parseFloat(formatUnits(baseCollateral || 0n, 18)) + parseFloat(collateralAmount)).toLocaleString(undefined, { 
                                    minimumFractionDigits: 2, 
                                    maximumFractionDigits: 4 
                                })} {pool?.collateralTokenSymbol}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Health Factor</span>
                                <span className={`${Number(health) / 100 < 1.1 ? 'text-red-500 dark:text-red-400' : Number(health) / 100 < 1.3 ? 'text-yellow-500 dark:text-yellow-400' : 'text-green-500 dark:text-green-400'}`}>
                                    {(Number(health) / 100).toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Liquidation Price</span>
                                <span>${(Number(formatUnits(liquidationPrice || 0n, 18))).toLocaleString(undefined, { 
                                    minimumFractionDigits: 2, 
                                    maximumFractionDigits: 2 
                                })}</span>
                            </div>
                        </div>
                    )}

                    {/* Action Button */}
                    <Button
                        className="w-full"
                        size="lg"
                        onClick={needsApproval ? handleApproveTokens : handleAddCollateral}
                        disabled={!collateralAmount || isDisabled || isExceedingBalance() || Number(collateralAmount) <= 0}
                    >
                        {buttonLabel}
                    </Button>

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