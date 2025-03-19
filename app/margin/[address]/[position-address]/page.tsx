'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Address, isAddress, formatUnits } from 'viem';
import { Button } from '@/components/shared/Button';
import { ArrowLeft, TrendingUp, AlertTriangle, ArrowDownCircle, ArrowUpCircle, Info, Scale, Wallet } from 'lucide-react';
import { usePosition } from '@/hooks/usePosition';
import { useLendingPoolFactory } from '@/hooks/useLendingPoolFactory';
import { formatAddress } from '@/lib/utils';

export default function PositionDetailsPage() {
    const params = useParams();
    const router = useRouter();
    
    // Client-side detection
    const [isClient, setIsClient] = useState(false);
    
    useEffect(() => {
        setIsClient(true);
        // Log raw params for debugging
        console.log("Raw URL params:", JSON.stringify(params));
    }, [params]);
    
    // Extract and validate parameters - fixing the hyphenated param issue
    // The param is "position-address" in the URL, not "positionAddress"
    let poolAddress: Address;
    let positionAddress: Address | undefined;
    
    // Handle TypeScript type safety for Address
    if (params && typeof params.address === 'string' && isAddress(params.address)) {
        poolAddress = params.address as Address;
    } else {
        // Default to a zero address if invalid
        poolAddress = '0x0000000000000000000000000000000000000000' as Address;
        console.error("Invalid pool address in params:", params?.address);
    }
    
    // Fix: Use "position-address" instead of "positionAddress"
    if (params && typeof params["position-address"] === 'string' && isAddress(params["position-address"])) {
        positionAddress = params["position-address"] as Address;
    } else {
        console.error("Invalid position address in params:", params?.["position-address"]);
    }
    
    // Log validated addresses
    useEffect(() => {
        console.log("Validated Addresses:", {
            poolAddress,
            positionAddress,
            isPoolValid: !!poolAddress && poolAddress !== '0x0000000000000000000000000000000000000000',
            isPositionValid: !!positionAddress && positionAddress !== '0x0000000000000000000000000000000000000000',
        });
    }, [poolAddress, positionAddress]);
    
    // Get pool data
    const { poolAddresses, pools } = useLendingPoolFactory();
    const poolIndex = poolAddresses.findIndex(addr => addr.toLowerCase() === poolAddress.toLowerCase());
    const pool = poolIndex !== -1 ? pools[poolIndex] : undefined;
    
    // Get position data with our improved hook - only fetch if position address is valid
    const {
        baseCollateral,
        effectiveCollateral,
        borrowShares,
        leverage,
        liquidationPrice,
        health,
        ltv,
        lastUpdated,
        formattedValues,
        
        // Status
        isLoading,
        error,
        refresh: refreshPosition,
        isValid: isValidPosition
    } = usePosition(positionAddress);

    // Debug logs for tracking data
    useEffect(() => {
        if (isClient) {
            console.log("Position Details - Pool:", pool);
            
            console.log("Position Details - Position Data:", {
                baseCollateral,
                effectiveCollateral,
                borrowShares,
                leverage,
                liquidationPrice,
                health,
                ltv,
                formattedValues,
                isValidPosition,
                error
            });
        }
    }, [
        isClient,
        pool, 
        baseCollateral, 
        effectiveCollateral, 
        borrowShares, 
        leverage, 
        liquidationPrice, 
        health, 
        ltv, 
        formattedValues,
        isValidPosition,
        error
    ]);

    // Handle position actions - also fix the URL paths here
    const handleAddCollateral = () => {
        if (!positionAddress) return;
        router.push(`/margin/${poolAddress}/${positionAddress}/add-collateral`);
    };

    const handleAdjustLeverage = () => {
        if (!positionAddress) return;
        router.push(`/margin/${poolAddress}/${positionAddress}/adjust-leverage`);
    };

    const handleRepay = () => {
        if (!positionAddress) return;
        router.push(`/margin/${poolAddress}/${positionAddress}/repay`);
    };

    const handleClosePosition = () => {
        if (!positionAddress) return;
        router.push(`/margin/${poolAddress}/${positionAddress}/close-position`);
    };

    if (!isClient) {
        return null; // Avoid rendering anything on server for consistent hydration
    }
    
    // Show error if position address is invalid
    if (!positionAddress || !isValidPosition) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Button
                    variant="ghost"
                    className="mb-6"
                    onClick={() => router.push('/margin')}
                >
                    <ArrowLeft className="size-4 mr-2" />
                    Back to Margin Trading
                </Button>
                
                <div className="max-w-xl mx-auto">
                    <div className="bg-card rounded-lg border p-6">
                        <div className="text-center py-8">
                            <AlertTriangle className="size-10 text-destructive mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">Invalid Position</h3>
                            <p className="text-muted-foreground mb-6">
                                The position address appears to be invalid or cannot be processed.
                                <br />
                                <code className="block mt-2 p-2 bg-muted rounded text-xs">
                                    Raw Position Address: {params?.["position-address"]?.toString() || 'undefined'}
                                </code>
                            </p>
                            
                            <div className="flex justify-center gap-3">
                                <Button 
                                    variant="outline" 
                                    onClick={() => router.push(`/margin/${poolAddress}`)}
                                >
                                    Back to Pool
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Button
                    variant="ghost"
                    className="mb-6"
                    onClick={() => router.push('/margin')}
                >
                    <ArrowLeft className="size-4 mr-2" />
                    Back to Margin Trading
                </Button>
                
                <div className="max-w-full mx-auto">
                    <div className="text-center">
                        <h2 className="text-xl font-semibold mb-4">Loading Position Data...</h2>
                        <div className="size-12 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Button
                    variant="ghost"
                    className="mb-6"
                    onClick={() => router.push('/margin')}
                >
                    <ArrowLeft className="size-4 mr-2" />
                    Back to Margin Trading
                </Button>
                
                <div className="max-w-xl mx-auto">
                    <div className="bg-card rounded-lg border p-6">
                        <div className="text-center py-8">
                            <AlertTriangle className="size-10 text-destructive mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">Error Loading Position</h3>
                            <p className="text-muted-foreground mb-6">{error || 'Failed to load position data'}</p>
                            
                            <div className="flex justify-center gap-3">
                                <Button 
                                    variant="outline" 
                                    onClick={() => router.push('/margin')}
                                >
                                    Go Back
                                </Button>
                                <Button
                                    onClick={() => refreshPosition()}
                                >
                                    Try Again
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <main className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <Button
                    variant="ghost"
                    onClick={() => router.push(`/margin/${poolAddress}`)}
                >
                    <ArrowLeft className="size-4 mr-2" />
                    Back to Pool
                </Button>
            </div>

            <div className="bg-card rounded-lg border p-6 mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-1">
                            {pool?.loanTokenSymbol}/{pool?.collateralTokenSymbol} Position
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Position ID: {formatAddress(positionAddress)}
                        </p>
                    </div>
                </div>

                {/* Position Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                    <div className="bg-muted/50 p-4 rounded-lg border">
                        <p className="text-sm text-muted-foreground mb-1">Base Collateral</p>
                        <p className="text-xl font-semibold">
                            {(Number(formatUnits(baseCollateral || 0n, 18))).toLocaleString(undefined, { 
                                minimumFractionDigits: 2, 
                                maximumFractionDigits: 4 
                            })} {pool?.collateralTokenSymbol}
                        </p>
                    </div>
                    
                    <div className="bg-muted/50 p-4 rounded-lg border">
                        <p className="text-sm text-muted-foreground mb-1">Effective Collateral</p>
                        <p className="text-xl font-semibold">
                            {(Number(formatUnits(effectiveCollateral || 0n, 18))).toLocaleString(undefined, { 
                                minimumFractionDigits: 2, 
                                maximumFractionDigits: 4 
                            })} {pool?.collateralTokenSymbol}
                        </p>
                    </div>
                    
                    <div className="bg-muted/50 p-4 rounded-lg border">
                        <p className="text-sm text-muted-foreground mb-1">Borrowed Amount</p>
                        <p className="text-xl font-semibold">
                            {(Number(formatUnits(borrowShares || 0n, 18))).toLocaleString(undefined, { 
                                minimumFractionDigits: 2, 
                                maximumFractionDigits: 2 
                            })} {pool?.loanTokenSymbol}
                        </p>
                    </div>
                </div>

                {/* Position Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-muted/30 rounded-lg border">
                        <p className="text-sm text-muted-foreground mb-1">Leverage</p>
                        <p className="text-lg font-semibold">{formattedValues.leverage.toFixed(2)}x</p>
                    </div>
                    
                    <div className="p-4 bg-muted/30 rounded-lg border">
                        <p className="text-sm text-muted-foreground mb-1">Liquidation Price</p>
                        <p className="text-lg font-semibold">${Number(formattedValues.liquidationPrice).toFixed(2)}</p>
                    </div>
                    
                    <div className="p-4 bg-muted/30 rounded-lg border">
                        <p className="text-sm text-muted-foreground mb-1">Health Factor</p>
                        <p className={`text-lg font-semibold ${
                            Number(formattedValues.health) < 1.1 
                                ? 'text-red-500' 
                                : Number(formattedValues.health) < 1.3 
                                ? 'text-yellow-500' 
                                : 'text-green-500'
                        }`}>
                            {formattedValues.health}
                        </p>
                    </div>
                    
                    <div className="p-4 bg-muted/30 rounded-lg border">
                        <p className="text-sm text-muted-foreground mb-1">LTV (Loan to Value)</p>
                        <p className="text-lg font-semibold">{(formattedValues.ltv * 100).toFixed(2)}%</p>
                    </div>
                </div>

                {/* Risk Alert */}
                {Number(formattedValues.health) < 1.3 && (
                    <div className="mt-6 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start gap-3">
                        <AlertTriangle className="size-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-amber-800 dark:text-amber-300">Position at risk</p>
                            <p className="text-sm text-amber-700 dark:text-amber-400">
                                This position has a low health factor and may be at risk of liquidation. 
                                Consider adding more collateral or reducing leverage.
                            </p>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Button
                        variant="outline"
                        className="gap-2"
                        onClick={handleAddCollateral}
                    >
                        <ArrowDownCircle className="size-4" />
                        Add Collateral
                    </Button>
                    
                    <Button
                        variant="outline"
                        className="gap-2"
                        onClick={handleAdjustLeverage}
                    >
                        <TrendingUp className="size-4" />
                        Adjust Leverage
                    </Button>
                    
                    <Button
                        variant="outline"
                        className="gap-2"
                        onClick={handleRepay}
                    >
                        <Wallet className="size-4" />
                        Repay Debt
                    </Button>
                    
                    <Button
                        variant="destructive"
                        className="gap-2"
                        onClick={handleClosePosition}
                    >
                        <ArrowUpCircle className="size-4" />
                        Close Position
                    </Button>
                </div>
            </div>
            
            {/* Pool Information */}
            <div className="bg-card rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4">Pool Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                        <p className="text-sm text-muted-foreground">Pool</p>
                        <p className="font-medium">{pool?.loanTokenSymbol}/{pool?.collateralTokenSymbol}</p>
                    </div>
                    
                    <div>
                        <p className="text-sm text-muted-foreground">Position Type</p>
                        <p className="font-medium">{pool?.positionType === 0 ? 'Long' : 'Short'}</p>
                    </div>
                    
                    <div>
                        <p className="text-sm text-muted-foreground">Pool Address</p>
                        <p className="font-medium font-mono text-sm">{formatAddress(poolAddress)}</p>
                    </div>
                    
                    <div>
                        <p className="text-sm text-muted-foreground">Interest Rate</p>
                        <p className="font-medium">{pool?.interestRate ? (Number(pool.interestRate)).toFixed(2) : '0.00'}%</p>
                    </div>
                    
                    <div>
                        <p className="text-sm text-muted-foreground">Liquidation Threshold</p>
                        <p className="font-medium">{pool?.liquidationThresholdPercentage ? (Number(pool.liquidationThresholdPercentage)).toFixed(0) : '0'}%</p>
                    </div>
                    
                    <div>
                        <p className="text-sm text-muted-foreground">Position Created</p>
                        <p className="font-medium">{lastUpdated ? new Date(Number(lastUpdated) * 1000).toLocaleDateString() : 'Unknown'}</p>
                    </div>
                </div>
            </div>
        </main>
    );
}