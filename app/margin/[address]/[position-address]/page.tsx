'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Address } from 'viem';
import { Button } from '@/components/shared/Button';
import { ArrowLeft, Info, TrendingUp, AlertTriangle, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { usePosition } from '@/hooks/usePosition';
import { useLendingPool } from '@/hooks/useLendingPool';
import { useLendingPoolFactory } from '@/hooks/useLendingPoolFactory';
import { formatTokenAmount } from '@/lib/utils/format';
import { formatAddress } from '@/lib/utils';
import { useAccount } from 'wagmi';
import { LiquidationCalculator } from '@/lib/health';

export default function PositionDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { address: userAddress } = useAccount();
    
    // Extract parameters
    const poolAddress = params.address as Address;
    const positionAddress = params.positionAddress as Address;
    
    // Client-side detection
    const [isClient, setIsClient] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');

    // Fix for hydration mismatch - only set isClient to true after component mounts
    useEffect(() => {
        setIsClient(true);
    }, []);
    
    // Get pool data
    const { poolAddresses, pools } = useLendingPoolFactory();
    const poolIndex = poolAddresses.findIndex(addr => addr.toLowerCase() === poolAddress.toLowerCase());
    const pool = poolIndex !== -1 ? pools[poolIndex] : undefined;
    
    // Get loan token price from lending pool
    const { ltp } = useLendingPool(poolAddress);
    
    // Get position data
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
        isWritePending
    } = usePosition(positionAddress);
    
    // If pool or position not found
    if (!isClient || (!pool && !isLoading)) {
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
                
                <div className="text-center py-16">
                    <h1 className="text-2xl font-bold mb-4">Position not found</h1>
                    <p className="text-muted-foreground mb-8">
                        The position you're looking for doesn't exist or has been closed.
                    </p>
                    <Button onClick={() => router.push('/margin')}>
                        Return to Margin Trading
                    </Button>
                </div>
            </div>
        );
    }

    // Calculate position statistics
    const stats = {
        netValue: effectiveCollateral ? Number(effectiveCollateral) * 1.2 : 0, // Simplified calculation
        pnl: 5.23, // Mock value - would be calculated based on entry price and current price
        pnlPercentage: 2.8, // Mock value
    };

    // Determine health status color and label
    let healthColor = 'text-green-500';
    let healthStatus = 'Healthy';

    if (health) {
        const healthValue = Number(health) / 100; // Convert from basis points
        if (healthValue < 1.1) {
            healthColor = 'text-red-500';
            healthStatus = 'At Risk';
        } else if (healthValue < 1.3) {
            healthColor = 'text-yellow-500';
            healthStatus = 'Caution';
        }
    }

    // Handle position actions
    const handleAddCollateral = () => {
        router.push(`/margin/${poolAddress}/${positionAddress}/add-collateral`);
    };

    const handleAdjustLeverage = () => {
        router.push(`/margin/${poolAddress}/${positionAddress}/adjust-leverage`);
    };

    const handleClosePosition = () => {
        router.push(`/margin/${poolAddress}/${positionAddress}/close`);
    };

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
                    <div className="space-y-6">
                        {/* Loading Skeleton for Position Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div>
                                <div className="h-8 bg-muted rounded w-48 animate-pulse"></div>
                                <div className="h-4 bg-muted rounded w-64 mt-2 animate-pulse"></div>
                            </div>
                            <div className="flex gap-2">
                                <div className="h-9 bg-muted rounded w-32 animate-pulse"></div>
                                <div className="h-9 bg-muted rounded w-32 animate-pulse"></div>
                            </div>
                        </div>
                        
                        {/* Loading Skeleton for Position Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="bg-card rounded-lg border p-6">
                                    <div className="h-4 bg-muted rounded w-24 animate-pulse mb-4"></div>
                                    <div className="h-7 bg-muted rounded w-32 animate-pulse mb-2"></div>
                                    <div className="h-4 bg-muted rounded w-48 animate-pulse"></div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Loading Skeleton for Position Details */}
                        <div className="bg-card rounded-lg border p-6">
                            <div className="h-6 bg-muted rounded w-32 animate-pulse mb-6"></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
                                        <div className="h-5 bg-muted rounded w-32 animate-pulse"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
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
                            <Button onClick={() => router.push('/margin')}>Go Back</Button>
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
                onClick={() => router.push(`/margin/${poolAddress}`)}
            >
                <ArrowLeft className="size-4 mr-2" />
                Back to Pool
            </Button>

            <div className="space-y-6">
                {/* Position Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-bold">
                                {pool?.loanTokenSymbol}/{pool?.collateralTokenSymbol} Position
                            </h1>
                            <div className={`ml-2 px-2 py-1 rounded-full text-xs ${healthColor} bg-opacity-20 flex items-center gap-1`}>
                                <span className={`size-1.5 rounded-full ${healthColor.replace('text', 'bg')}`}></span>
                                {healthStatus}
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Position ID: {formatAddress(positionAddress)}
                        </p>
                    </div>

                    {isClient && (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1"
                                onClick={handleAddCollateral}
                            >
                                <ArrowDownCircle className="size-3.5" />
                                Add Collateral
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1"
                                onClick={handleAdjustLeverage}
                            >
                                <TrendingUp className="size-3.5" />
                                Adjust Leverage
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                className="gap-1"
                                onClick={handleClosePosition}
                            >
                                <ArrowUpCircle className="size-3.5" />
                                Close Position
                            </Button>
                        </div>
                    )}
                </div>

                {/* Navigation Tabs */}
                <div className="flex border-b">
                    <button
                        className={`py-2 px-4 font-medium ${activeTab === 'overview' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button
                        className={`py-2 px-4 font-medium ${activeTab === 'history' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
                        onClick={() => setActiveTab('history')}
                    >
                        Transaction History
                    </button>
                </div>

                {/* Main Content */}
                {activeTab === 'overview' ? (
                    <>
                        {/* Position Risk Warning (if unhealthy) */}
                        {health && Number(health) / 100 < 1.3 && (
                            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start gap-3">
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

                        {/* Position Statistics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Net Value */}
                            <div className="bg-card rounded-lg border p-6">
                                <h3 className="text-sm text-muted-foreground mb-2">Net Value</h3>
                                <p className="text-3xl font-bold">
                                    ${stats.netValue.toFixed(2)}
                                </p>
                                <div className={`flex items-center gap-1 mt-2 ${stats.pnlPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    <span>{stats.pnlPercentage >= 0 ? '+' : ''}{stats.pnlPercentage}%</span>
                                    <span className="text-muted-foreground text-sm">(${stats.pnl.toFixed(2)})</span>
                                </div>
                            </div>
                            
                            {/* Health Factor */}
                            <div className="bg-card rounded-lg border p-6">
                                <h3 className="text-sm text-muted-foreground mb-2">Health Factor</h3>
                                <p className={`text-3xl font-bold ${healthColor}`}>
                                    {formattedValues.health}
                                </p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Liquidation at &lt; 1.0
                                </p>
                            </div>
                            
                            {/* Liquidation Price */}
                            <div className="bg-card rounded-lg border p-6">
                                <h3 className="text-sm text-muted-foreground mb-2">Liquidation Price</h3>
                                <p className="text-3xl font-bold">
                                    ${formattedValues.liquidationPrice}
                                </p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Current price buffer: 23.4%
                                </p>
                            </div>
                        </div>
                        
                        {/* Position Details */}
                        <div className="bg-card rounded-lg border p-6">
                            <h3 className="text-lg font-semibold mb-4">Position Details</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div>
                                    <p className="text-sm text-muted-foreground">Base Collateral</p>
                                    <p className="font-medium">{formattedValues.baseCollateral} {pool?.collateralTokenSymbol}</p>
                                </div>
                                
                                <div>
                                    <p className="text-sm text-muted-foreground">Effective Collateral</p>
                                    <p className="font-medium">{formattedValues.effectiveCollateral} {pool?.collateralTokenSymbol}</p>
                                </div>
                                
                                <div>
                                    <p className="text-sm text-muted-foreground">Borrowed Amount</p>
                                    <p className="font-medium">{formattedValues.borrowShares} {pool?.loanTokenSymbol}</p>
                                </div>
                                
                                <div>
                                    <p className="text-sm text-muted-foreground">Leverage</p>
                                    <p className="font-medium">{formattedValues.leverage}x</p>
                                </div>
                                
                                <div>
                                    <p className="text-sm text-muted-foreground">LTV (Loan to Value)</p>
                                    <p className="font-medium">{(formattedValues.ltv * 100).toFixed(2)}%</p>
                                </div>
                                
                                <div>
                                    <p className="text-sm text-muted-foreground">Pool</p>
                                    <p className="font-medium">{pool?.loanTokenSymbol}/{pool?.collateralTokenSymbol}</p>
                                </div>
                                
                                <div>
                                    <p className="text-sm text-muted-foreground">Position Type</p>
                                    <p className="font-medium">{pool?.positionType === 0 ? 'Long' : 'Short'}</p>
                                </div>
                                
                                <div>
                                    <p className="text-sm text-muted-foreground">Created</p>
                                    <p className="font-medium">{lastUpdated ? new Date(Number(lastUpdated) * 1000).toLocaleDateString() : 'Unknown'}</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Pool Information */}
                        <div className="bg-card rounded-lg border p-6">
                            <h3 className="text-lg font-semibold mb-4">Pool Information</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <p className="text-sm text-muted-foreground">Pool Address</p>
                                    <p className="font-medium font-mono text-sm">{formatAddress(poolAddress)}</p>
                                </div>
                                
                                <div>
                                    <p className="text-sm text-muted-foreground">Loan Token</p>
                                    <p className="font-medium">{pool?.loanTokenSymbol} ({pool?.loanTokenName})</p>
                                </div>
                                
                                <div>
                                    <p className="text-sm text-muted-foreground">Collateral Token</p>
                                    <p className="font-medium">{pool?.collateralTokenSymbol} ({pool?.collateralTokenName})</p>
                                </div>
                                
                                <div>
                                    <p className="text-sm text-muted-foreground">Liquidation Threshold</p>
                                    <p className="font-medium">{pool?.liquidationThresholdPercentage ? Number(pool.liquidationThresholdPercentage).toString() : '0'}%</p>
                                </div>
                                
                                <div>
                                    <p className="text-sm text-muted-foreground">Interest Rate</p>
                                    <p className="font-medium">{pool?.interestRate ? Number(pool.interestRate).toString() : '0'}%</p>
                                </div>
                                
                                <div>
                                    <p className="text-sm text-muted-foreground">Created By</p>
                                    <p className="font-medium font-mono text-sm">{formatAddress(pool?.creator || '0x0000000000000000000000000000000000000000' as Address)}</p>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="bg-card rounded-lg border p-6">
                        <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
                        
                        {/* Transaction history - in a real app, this would be fetched from the blockchain or your backend */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4">Date</th>
                                        <th className="text-left py-3 px-4">Type</th>
                                        <th className="text-left py-3 px-4">Amount</th>
                                        <th className="text-left py-3 px-4">Transaction</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b">
                                        <td className="py-3 px-4">{new Date().toLocaleDateString()}</td>
                                        <td className="py-3 px-4">Position Opened</td>
                                        <td className="py-3 px-4">{formattedValues.baseCollateral} {pool?.collateralTokenSymbol}</td>
                                        <td className="py-3 px-4">
                                            <a href="#" className="text-primary hover:underline font-mono text-sm">0x1234...5678</a>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}