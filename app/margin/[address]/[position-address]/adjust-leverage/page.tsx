'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { Address, formatUnits } from 'viem';
import { Button } from '@/components/shared/Button';
import { ArrowLeft, AlertTriangle, ExternalLink, TrendingUp, Info } from 'lucide-react';
import { usePosition } from '@/hooks/usePosition';
import { useLendingPool } from '@/hooks/useLendingPool';
import { useLendingPoolFactory } from '@/hooks/useLendingPoolFactory';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { toast } from 'sonner';
import { formatAddress } from '@/lib/utils';
import { positionABI } from '@/lib/abis/position';
import { LiquidationCalculator } from '@/lib/health';
import { convertPrice } from '@/lib/convertPrice';

export default function AdjustLeveragePage() {
    const router = useRouter();
    const params = useParams();
    const poolAddress = params.address as Address;
    const positionAddress = params["position-address"] as Address;
    
    // State management
    const [newLeverage, setNewLeverage] = useState(150); // Basis points: 1.5x
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
    const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
    const [isClient, setIsClient] = useState(false);

    // Client-side detection
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

    // Initialize with current leverage
    useEffect(() => {
        if (leverage) {
            setNewLeverage(Number(leverage));
        }
    }, [leverage]);

    // Watch for transaction completion
    useEffect(() => {
        if (receipt?.status === 'success') {
            toast.dismiss('tx-confirm');
            toast.success('Leverage updated successfully!');
            
            refreshPosition();
            
            setTimeout(() => {
                router.push(`/margin/${poolAddress}/${positionAddress}`);
            }, 1000);
        } else if (receipt?.status === 'reverted') {
            toast.dismiss('tx-confirm');
            toast.error('Transaction failed: The contract reverted the operation');
        }
    }, [receipt, router, poolAddress, positionAddress, refreshPosition]);

    // Calculate current values
    const currentHealth = Number(health) / 100 || 0;
    const currentLiquidationPrice = liquidationPrice 
        ? Number(formatUnits(liquidationPrice, 18)) 
        : 0;
    
    // Calculate the new health factor and liquidation price based on the new leverage
    // Following the calculation pattern in trade page
    const updatedMetrics = useMemo(() => {
        console.log('Calculating updated metrics with inputs:', {
            baseCollateral: baseCollateral ? formatUnits(baseCollateral, 18) : 'undefined',
            leverage: leverage ? Number(leverage) / 100 : 'undefined',
            newLeverage: newLeverage / 100,
            ltp: ltp ? Number(ltp) : 'undefined'
        });

        if (!baseCollateral || !ltp) {
            return {
                newHealth: currentHealth,
                newLiquidationPrice: currentLiquidationPrice,
                healthChange: 0,
                liquidationPriceChange: 0
            };
        }

        try {
            // Following the trade page calculation approach
            const collateralValue = Number(formatUnits(baseCollateral, 18));
            console.log('Base collateral value:', collateralValue);
            
            // Convert leverage from decimal (1.5) to basis points (150)
            const leverageBasisPoints = newLeverage;
            console.log('Leverage basis points:', leverageBasisPoints);

            // Calculate borrowCollateral: baseCollateral * (leverage - 100) / 100
            const borrowCollateral = (collateralValue * (leverageBasisPoints - 100)) / 100;
            console.log('Borrow collateral amount:', borrowCollateral);

            // Calculate borrowAmount using convertPrice
            const borrowAmount = convertPrice(
                pool?.loanTokenSymbol || "laWBTC", 
                pool?.collateralTokenSymbol || "laUSDC", 
                borrowCollateral
            );
            console.log('Borrow amount in loan token:', borrowAmount);

            // Calculate effective collateral: baseCollateral * leverageBasisPoints / 100
            const effectiveCollateral = collateralValue * leverageBasisPoints / 100;
            console.log('Effective collateral:', effectiveCollateral);
            
            // Convert effective collateral to loan token price
            const effectiveCollateralPrice = convertPrice(
                pool?.loanTokenSymbol || "laWBTC", 
                pool?.collateralTokenSymbol || "laUSDC", 
                effectiveCollateral
            );
            console.log('Effective collateral price in loan token:', effectiveCollateralPrice);

            // Use LiquidationCalculator from health.ts file
            const calculator = new LiquidationCalculator(ltp);
            
            // Calculate liquidation price
            const newLiquidationPrice = calculator.getLiquidationPrice(effectiveCollateral, borrowAmount);
            console.log('Raw liquidation price:', newLiquidationPrice);
            
            // Calculate health factor
            const newHealthFactor = calculator.getHealth(effectiveCollateralPrice, borrowAmount);
            console.log('Health factor:', newHealthFactor);
            
            // Calculate loan-to-value
            const newLTV = calculator.getLTV(effectiveCollateralPrice, borrowAmount);
            console.log('Loan to value:', newLTV);
            
            // Calculate changes
            const healthChange = newHealthFactor - currentHealth;
            const liquidationPriceChange = newLiquidationPrice - currentLiquidationPrice;
            
            console.log('Final calculated values:', {
                newHealth: newHealthFactor,
                currentHealth,
                healthChange,
                newLiquidationPrice,
                currentLiquidationPrice,
                liquidationPriceChange,
                newLTV
            });
            
            return {
                borrowAmount,
                newHealth: newHealthFactor,
                newLiquidationPrice,
                healthChange,
                liquidationPriceChange,
                newLTV
            };
        } catch (error) {
            console.error('Error calculating position details:', error);
            return {
                borrowAmount: 0,
                newHealth: currentHealth,
                newLiquidationPrice: currentLiquidationPrice,
                healthChange: 0,
                liquidationPriceChange: 0,
                newLTV: 0
            };
        }
    }, [
        baseCollateral, 
        leverage, 
        newLeverage, 
        ltp, 
        currentHealth, 
        currentLiquidationPrice,
        pool?.loanTokenSymbol,
        pool?.collateralTokenSymbol
    ]);

    // Update leverage
    const handleUpdateLeverage = async () => {
        if (!newLeverage) return;
        
        setIsConfirmationVisible(false);

        try {
            toast.loading('Updating leverage...', { id: 'update-leverage' });

            writeContract({
                address: positionAddress,
                abi: positionABI,
                functionName: 'updateLeverage',
                args: [BigInt(newLeverage)],
            }, {
                onSuccess: (hash) => {
                    console.log('Update leverage transaction hash:', hash);
                    setTxHash(hash);
                    toast.dismiss('update-leverage');
                    toast.loading('Transaction submitted, waiting for confirmation...', { id: 'tx-confirm' });
                },
                onError: (error) => {
                    console.error('Update leverage error:', error);
                    toast.dismiss('update-leverage');
                    toast.error('Failed to update leverage: ' + error.message);
                }
            });
        } catch (error) {
            console.error('Error updating leverage:', error);
            toast.dismiss('update-leverage');
            toast.error('Failed to update leverage');
        }
    };

    // Action button state
    const isDisabled = isWritePending || isConfirming || Number(newLeverage) === Number(leverage);
    const buttonLabel = isWritePending || isConfirming ? 'Updating Leverage...' : 'Update Leverage';

    if (!isClient) {
        return null; // Avoid hydration mismatch
    }

    if (!pool || (isLoadingPosition && !positionError)) {
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
                        <TrendingUp className="size-10 text-primary mx-auto mb-4" />
                        <h1 className="text-xl font-bold mb-2 text-center">Adjust Leverage</h1>
                        <p className="text-sm text-muted-foreground text-center">
                            Adjust leverage for your {pool.loanTokenSymbol}/{pool.collateralTokenSymbol} position
                        </p>
                    </div>

                    {/* Current Position Summary */}
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Position</span>
                            <span className="font-mono text-sm">{formatAddress(positionAddress)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Current Leverage</span>
                            <span>{(Number(leverage) / 100).toFixed(2)}x</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Base Collateral</span>
                            <span>{(Number(formatUnits(baseCollateral || 0n, 18))).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 4
                            })} {pool.collateralTokenSymbol}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Health Factor</span>
                            <span className={`${currentHealth < 1.1 ? 'text-red-500' : currentHealth < 1.3 ? 'text-yellow-500' : 'text-green-500'}`}>
                                {currentHealth.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Liquidation Price</span>
                            <span>${currentLiquidationPrice.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}</span>
                        </div>
                    </div>

                    {/* Leverage Slider */}
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <h2 className="text-lg font-medium">New Leverage</h2>
                            <div className="text-lg font-bold">
                                {(newLeverage / 100).toFixed(2)}x
                            </div>
                        </div>

                        <div className="space-y-2">
                            <input
                                type="range"
                                min="100"
                                max="300"
                                step="5"
                                value={newLeverage}
                                onChange={(e) => setNewLeverage(parseInt(e.target.value))}
                                className="w-full"
                                disabled={isWritePending || isConfirming}
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>1.00x</span>
                                <span>2.00x</span>
                                <span>3.00x</span>
                            </div>
                        </div>
                    </div>

                    {/* Risk Warning for higher leverage */}
                    {newLeverage > Number(leverage) && (
                        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start gap-3">
                            <AlertTriangle className="size-5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-amber-800 dark:text-amber-300">Increased Risk</p>
                                <p className="text-sm text-amber-700 dark:text-amber-400">
                                    Increasing your leverage will decrease your health factor and increase your
                                    liquidation price, making your position more vulnerable to liquidation.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Information for lowering leverage */}
                    {newLeverage < Number(leverage) && (
                        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
                            <Info className="size-5 text-blue-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-blue-800 dark:text-blue-300">Reduced Risk</p>
                                <p className="text-sm text-blue-700 dark:text-blue-400">
                                    Decreasing your leverage will increase your health factor and decrease your
                                    liquidation price, making your position more resilient to market volatility.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Position after adjusting leverage */}
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">New Leverage</span>
                            <span>{(newLeverage / 100).toFixed(2)}x</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">New Health Factor</span>
                            <span className={`${updatedMetrics.newHealth < 1.1 ? 'text-red-500' : updatedMetrics.newHealth < 1.3 ? 'text-yellow-500' : 'text-green-500'}`}>
                                {updatedMetrics.newHealth.toFixed(2)}
                                {updatedMetrics.healthChange !== 0 && (
                                    <span className={updatedMetrics.healthChange > 0 ? "text-green-500 ml-1" : "text-red-500 ml-1"}>
                                        ({updatedMetrics.healthChange > 0 ? "+" : ""}{updatedMetrics.healthChange.toFixed(2)})
                                    </span>
                                )}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">New Liquidation Price</span>
                            <span>
                                ${updatedMetrics.newLiquidationPrice.toFixed(2)}
                                {updatedMetrics.liquidationPriceChange !== 0 && (
                                    <span className={updatedMetrics.liquidationPriceChange < 0 ? "text-green-500 ml-1" : "text-red-500 ml-1"}>
                                        ({updatedMetrics.liquidationPriceChange > 0 ? "+" : ""}{updatedMetrics.liquidationPriceChange.toFixed(2)})
                                    </span>
                                )}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Loan-to-Value (LTV)</span>
                            <span>
                                {((updatedMetrics.newLTV ?? 0) * 100).toFixed(2)}%
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Position Effect</span>
                            <span className={newLeverage > Number(leverage) ? "text-amber-500 italic" : "text-blue-500 italic"}>
                                {newLeverage > Number(leverage) ? "Higher risk, higher potential return" : "Lower risk, lower potential return"}
                            </span>
                        </div>
                    </div>

                    {/* Confirmation Dialog */}
                    {isConfirmationVisible ? (
                        <div className="space-y-4">
                            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
                                <p className="font-medium">Are you sure you want to update the leverage to {(newLeverage / 100).toFixed(2)}x?</p>
                                {newLeverage > Number(leverage) && (
                                    <p className="text-sm text-amber-500 mt-2">
                                        This will increase your risk of liquidation!
                                    </p>
                                )}
                                {newLeverage < Number(leverage) && (
                                    <p className="text-sm text-green-500 mt-2">
                                        This will reduce your risk of liquidation.
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    className="flex-1"
                                    variant="outline"
                                    onClick={() => setIsConfirmationVisible(false)}
                                    disabled={isDisabled}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1"
                                    onClick={handleUpdateLeverage}
                                    disabled={isDisabled}
                                >
                                    Confirm
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Button
                            className="w-full"
                            size="lg"
                            onClick={() => setIsConfirmationVisible(true)}
                            disabled={isDisabled}
                        >
                            {buttonLabel}
                        </Button>
                    )}

                    {/* Transaction Hash (if submitted) */}
                    {txHash && (
                        <div className="flex items-center justify-between pt-2 text-sm text-muted-foreground">
                            <span>Transaction:</span>
                            <a 
                                href={`https://sepolia.arbiscan.io/tx/${txHash}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-primary hover:underline"
                            >
                                {formatAddress(txHash)}
                                <ExternalLink className="size-3.5" />
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}