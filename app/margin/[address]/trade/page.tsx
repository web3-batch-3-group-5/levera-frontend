'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Address, parseUnits, formatUnits, zeroAddress } from 'viem';
import { useAccount } from 'wagmi';
import { Button } from '@/components/shared/Button';
import { ArrowLeft, Info, WalletIcon } from 'lucide-react';
import { useLendingPool } from '@/hooks/useLendingPool';
import { useLendingPoolFactory } from '@/hooks/useLendingPoolFactory';
import { usePositionFactory } from '@/hooks/usePositionFactory';
import { formatTokenAmount } from '@/lib/utils/format';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { erc20Abi } from 'viem';
import { toast } from 'sonner';
import { LiquidationCalculator } from '@/lib/health';
import { CONTRACTS } from '@/config/contracts'; 

export default function MarginTradePage() {
    const router = useRouter();
    const params = useParams();
    const poolAddress = params.address as Address;
    const { address: userAddress } = useAccount();

    // State management
    const [collateralAmount, setCollateralAmount] = useState('');
    const [leverage, setLeverage] = useState(1.5);
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
    const [needsApproval, setNeedsApproval] = useState(true);

    // Get pool data
    const { poolAddresses, pools } = useLendingPoolFactory();
    const poolIndex = poolAddresses.findIndex(addr => addr.toLowerCase() === poolAddress.toLowerCase());
    const pool = poolIndex !== -1 ? pools[poolIndex] : undefined;

    // Get pool details
    const { ltp } = useLendingPool(poolAddress);

    // Get position creation function
    const { createPosition, isCreatingPosition } = usePositionFactory();
    
    // Contract functions for approvals
    const { writeContract } = useWriteContract();

    // Transaction confirmation
    const { isLoading: isConfirming, data: receipt } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    // Get token balance
    const { data: walletBalance } = useReadContract({
        address: pool?.collateralToken,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [userAddress || zeroAddress],
    });

    // Get token allowance
    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: pool?.collateralToken,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [userAddress || zeroAddress, poolAddress],
    });

    // Check if approval is needed
    useEffect(() => {
        if (!collateralAmount || !allowance || !pool?.collateralToken) return;

        try {
            const amount = parseUnits(collateralAmount, 18);
            setNeedsApproval(allowance < amount);
        } catch (error) {
            console.error('Error checking allowance:', error);
        }
    }, [collateralAmount, allowance, pool?.collateralToken]);

    // Watch for transaction completion
    useEffect(() => {
        if (receipt?.status === 'success') {
            toast.dismiss('tx-confirm');
            
            if (needsApproval) {
                toast.success('Token approved successfully!');
                refetchAllowance().then(() => {
                    setNeedsApproval(false);
                });
            } else {
                toast.success('Position created successfully!');
                router.push(`/margin/${poolAddress}`);
            }
        }
    }, [receipt, router, poolAddress, needsApproval, refetchAllowance]);

    // Calculate position details based on contract logic
    const calculatePositionDetails = () => {
        if (!collateralAmount || !leverage) {
            return {
                borrowAmount: 0n,
                liquidationPrice: '0.00',
                healthFactor: 1.0,
                loanToValue: 0.33,
                effectiveCollateral: 0
            };
        }

        try {
            const collateralValue = parseFloat(collateralAmount);
            
            // Following the contract logic in PositionFactory.createPosition
            // borrowAmount = convertCollateralPrice(_baseCollateral * (_leverage - 100) / 100)
            const leverageBasisPoints = Math.floor(leverage * 100); // Convert from decimal to basis points (1.5 -> 150)
            const borrowCollateral = collateralValue * (leverageBasisPoints - 100) / 100;
            const borrowAmount = borrowCollateral; // Simplified - would use convertCollateralPrice in real implementation
            
            // effectiveCollateral = _baseCollateral * _leverage / 100
            const effectiveCollateral = collateralValue * leverageBasisPoints / 100;
            
            // Use LiquidationCalculator from health.ts
            const calculator = new LiquidationCalculator(ltp || 80n); // Use pool's ltp value
            const liquidationPrice = calculator.getLiquidationPrice(effectiveCollateral, borrowAmount);
            const healthFactor = calculator.getHealth(effectiveCollateral, borrowAmount);
            const loanToValue = calculator.getLTV(effectiveCollateral, borrowAmount);

            return {
                borrowAmount: parseUnits(borrowAmount.toFixed(18), 18),
                liquidationPrice: liquidationPrice.toFixed(4),
                healthFactor: healthFactor,
                loanToValue: loanToValue,
                effectiveCollateral: effectiveCollateral
            };
        } catch (error) {
            console.error('Error calculating position details:', error);
            return {
                borrowAmount: 0n,
                liquidationPrice: '0.00',
                healthFactor: 1.0,
                loanToValue: 0.33,
                effectiveCollateral: 0
            };
        }
    };

    const positionDetails = calculatePositionDetails();

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

    // Check if approval is needed
    useEffect(() => {
        if (!collateralAmount || !allowance || !pool?.collateralToken) return;

        try {
            const amount = parseUnits(collateralAmount, 18);
            setNeedsApproval(allowance < amount);
        } catch (error) {
            console.error('Error checking allowance:', error);
        }
    }, [collateralAmount, allowance, pool?.collateralToken]);

    // Watch for transaction completion
    useEffect(() => {
        if (receipt?.status === 'success') {
            toast.dismiss('tx-confirm');
            
            if (needsApproval) {
                toast.success('Token approved successfully!');
                refetchAllowance().then(() => {
                    setNeedsApproval(false);
                });
            } else {
                toast.success('Position created successfully!');
                router.push(`/margin/${poolAddress}`);
            }
        }
    }, [receipt, router, poolAddress, needsApproval, refetchAllowance]);

    // Approve collateral tokens
    const handleApproveCollateral = async () => {
        if (!collateralAmount || !pool || !userAddress) return;
    
        try {
            const amount = parseUnits(collateralAmount, 18);
    
            toast.loading('Approving tokens...', { id: 'approve-tx' });
    
            writeContract({
                address: pool.collateralToken,
                abi: erc20Abi,
                functionName: 'approve',
                args: [CONTRACTS.POSITION_FACTORY.address, amount],
            }, {
                onSuccess: (hash) => {
                    console.log('Transaction Hash:', hash);
                    setTxHash(hash);
                    toast.dismiss('approve-tx');
                    toast.loading('Approval transaction submitted...', {
                        id: 'tx-confirm' 
                    });
                },
                onError: (error) => {
                    console.error('Error approving collateral:', error);
                    toast.dismiss('approve-tx');
                    toast.error('Failed to approve collateral');
                }
            });
        } catch (error) {
            console.error('Error approving collateral:', error);
            toast.dismiss('approve-tx');
            toast.error('Failed to approve collateral');
        }
    };

    // Open position
    const handleOpenPosition = async () => {
        if (!collateralAmount || !pool || !userAddress) return;

        try {
            const collateralAmountBigInt = parseUnits(collateralAmount, 18);
            const leverageBasisPoints = BigInt(Math.floor(leverage * 100)); // Convert to basis points 

            toast.loading('Creating position...', { id: 'create-position' });

            // Use writeContract with onSuccess callback instead of createPosition
            writeContract({
                address: CONTRACTS.POSITION_FACTORY.address,
                abi: CONTRACTS.POSITION_FACTORY.abi,
                functionName: 'createPosition',
                args: [poolAddress, collateralAmountBigInt, leverageBasisPoints],
            }, {
                onSuccess: (hash) => {
                    console.log('Transaction Hash:', hash);
                    setTxHash(hash);
                    toast.dismiss('create-position');
                    toast.loading('Transaction submitted, waiting for confirmation...', {
                        id: 'tx-confirm'
                    });
                },
                onError: (error) => {
                    console.error('Transaction Error:', error);
                    toast.dismiss('create-position');
                    toast.error('Failed to create position: ' + error.message);
                }
            });
        } catch (error) {
            console.error('Error creating position:', error);
            toast.dismiss('create-position');
            toast.error('Failed to create position');
        }
    };

    if (!pool) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Pool not found</h1>
                    <Button onClick={() => router.back()}>
                        <ArrowLeft className="size-4 mr-2" />
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <main className="container mx-auto px-4 py-8">
            <Button
                variant="ghost"
                className="mb-6"
                onClick={() => router.back()}
            >
                <ArrowLeft className="size-4 mr-2" />
                Back
            </Button>

            <div className="max-w-xl mx-auto">
                <div className="bg-card rounded-lg border p-6 space-y-6">
                    <div>
                        <h1 className="text-xl font-bold mb-2 px-2">{pool.loanTokenSymbol}/{pool.collateralTokenSymbol} Trade</h1>
                        <p className="text-sm text-muted-foreground px-2">
                            Open a margin position with this pool
                        </p>
                    </div>

                    {/* Collateral Input */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-2">
                            <h2 className="text-lg font-medium">Collateral</h2>
                            <div className="text-sm text-muted-foreground">
                                Balance: {formatTokenAmount(walletBalance || 0n)} {pool.collateralTokenSymbol}
                            </div>
                        </div>

                        <div className="relative">
                            <input
                                type="number"
                                value={collateralAmount}
                                onChange={(e) => setCollateralAmount(e.target.value)}
                                className="w-full bg-background p-3 rounded border"
                                placeholder="0.00"
                                disabled={isCreatingPosition || isConfirming}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <span className="text-sm font-medium pr-6">{pool.collateralTokenSymbol}</span>
                            </div>
                        </div>

                        {isExceedingBalance() && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
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
                                    disabled={isCreatingPosition || isConfirming}
                                >
                                    {percentage}%
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Leverage Slider */}
                    <div className="space-y-2">
                        <div className="flex justify-between px-2">
                            <span>Leverage</span>
                            <span>{leverage.toFixed(2)}x</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="3"
                            step="0.1"
                            value={leverage}
                            onChange={(e) => setLeverage(parseFloat(e.target.value))}
                            className="w-full"
                            disabled={isCreatingPosition || isConfirming}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground px-1">
                            <span>1x</span>
                            <span>2x</span>
                            <span>3x</span>
                        </div>
                    </div>

                    {/* Position Summary */}
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Base Collateral</span>
                            <span>{parseFloat(collateralAmount || '0').toFixed(4)} {pool.collateralTokenSymbol}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Effective Collateral</span>
                            <span>{positionDetails.effectiveCollateral.toFixed(4)} {pool.collateralTokenSymbol}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Borrow Amount</span>
                            <span>{formatUnits(positionDetails.borrowAmount, 18)} {pool.loanTokenSymbol}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Liquidation Price</span>
                            <span>${positionDetails.liquidationPrice}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Health Factor</span>
                            <span className={positionDetails.healthFactor < 1.1 ? "text-red-500" : 
                                positionDetails.healthFactor < 1.3 ? "text-yellow-500" : "text-green-500"}>
                                {positionDetails.healthFactor.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Loan to Value</span>
                            <span>{(positionDetails.loanToValue * 100).toFixed(2)}%</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {needsApproval ? (
                        <Button
                            className="w-full"
                            size="lg"
                            onClick={handleApproveCollateral}
                            disabled={!collateralAmount || isExceedingBalance() || isCreatingPosition || isConfirming || Number(collateralAmount) <= 0}
                        >
                            {isConfirming ? 'Approving...' : 'Approve Collateral'}
                        </Button>
                    ) : (
                        <Button
                            className="w-full"
                            size="lg"
                            onClick={handleOpenPosition}
                            disabled={!collateralAmount || isExceedingBalance() || isCreatingPosition || isConfirming || Number(collateralAmount) <= 0}
                        >
                            {isCreatingPosition || isConfirming ? 'Creating Position...' : 'Create Position'}
                        </Button>
                    )}
                </div>
            </div>
        </main>
    );
}