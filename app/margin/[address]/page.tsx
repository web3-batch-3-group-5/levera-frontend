'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Address } from 'viem';
import { Button } from '@/components/shared/Button';
import { ArrowLeft, Info, ChevronRight, AlertTriangle, Plus, Scale, Activity, TrendingUp } from 'lucide-react';
import { useLendingPool } from '@/hooks/useLendingPool';
import { useLendingPoolFactory } from '@/hooks/useLendingPoolFactory';
import { usePositionFactory } from '@/hooks/usePositionFactory';
import { formatTokenAmount } from '@/lib/utils/format';
import { formatAddress } from '@/lib/utils';
import { useAccount } from 'wagmi';
import { MarginCard } from '@/components/margin/MarginCard';

// Helper function to format percentage
const formatPercentage = (value: number) => {
    return value.toLocaleString(undefined, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2
    }) + '%';
};

export default function MarginDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const poolAddress = params.address as Address;
    const { address: userAddress, isConnected } = useAccount();
    // Client-side detection
    const [isClient, setIsClient] = useState(false);

    // Fix for hydration mismatch - only set isClient to true after component mounts
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Get pool details
    const { poolAddresses, pools } = useLendingPoolFactory();
    const poolIndex = poolAddresses.findIndex(addr => addr.toLowerCase() === poolAddress.toLowerCase());
    const pool = poolIndex !== -1 ? pools[poolIndex] : undefined;

    // Get pool data
    const {
        totalSupplyAssets,
        totalBorrowAssets,
        interestRate,
        ltp,
        isLoading: isLoadingPool,
        error: poolError
    } = useLendingPool(poolAddress);

    // Get user positions for this specific pool
    const { 
        userPositions, 
        isLoading: isLoadingPositions, 
        error: positionsError,
        getPositionsByPoolId
    } = usePositionFactory();

    // Filter positions for this specific pool
    const poolPositions = userPositions.filter((position: any) => {
        // Safely check for pool address match, handling different position structures
        const positionLendingPoolAddress = position.lendingPool?.address || position.pool?.address;
        return positionLendingPoolAddress?.toLowerCase() === poolAddress.toLowerCase();
    });

    // Calculate utilization rate
    const utilizationRate = totalSupplyAssets && totalSupplyAssets > 0n
        ? (Number(totalBorrowAssets || 0n) / Number(totalSupplyAssets)) * 100
        : 0;

    const handleOpenPosition = () => {
        router.push(`/margin/${poolAddress}/trade`);
    };

    // Loading state
    const isLoading = isLoadingPool || isLoadingPositions;
    const error = poolError || positionsError;

    // If pool not found
    if (!isLoading && !pool) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Button
                    variant="ghost"
                    onClick={() => router.push('/margin')}
                    className="gap-2 mb-8"
                >
                    <ArrowLeft className="size-4" />
                    Back To Margin Trading
                </Button>

                <div className="text-center py-12 border rounded-lg bg-card">
                    <AlertTriangle className="size-12 text-destructive mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Pool Not Found</h2>
                    <p className="text-muted-foreground mb-6">
                        The margin trading pool you're looking for doesn't exist or has been removed.
                    </p>
                    <Button onClick={() => router.push('/margin')}>
                        Return to Margin Trading
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <main className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="gap-2"
                >
                    <ArrowLeft className="size-4" />
                    Back To Margin Trading
                </Button>
            </div>

            <div className="space-y-8">
                {/* Error State */}
                {error && (
                    <div className="bg-destructive/10 border border-destructive rounded-lg p-4 flex items-center gap-3">
                        <AlertTriangle className="size-5 text-destructive flex-shrink-0" />
                        <div>
                            <h3 className="font-medium text-destructive">Error loading data</h3>
                            <p className="text-sm text-muted-foreground">
                                {error.message || 'An error occurred while loading the pool data. Please try again later.'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Title Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">
                            {isLoading ? (
                                <div className="h-9 bg-muted rounded w-48 animate-pulse"></div>
                            ) : (
                                <>{pool?.loanTokenSymbol}/{pool?.collateralTokenSymbol} Trading Pool</>
                            )}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">Pool Address: {formatAddress(poolAddress)}</p>
                    </div>
                    <div>
                        {/* Only render client-side content after mount to avoid hydration mismatch */}
                        {isClient && isConnected && (
                            <Button 
                                onClick={handleOpenPosition}
                                className="gap-2"
                            >
                                <Plus className="size-4" />
                                Open Position
                            </Button>
                        )}
                    </div>
                </div>

                {/* Pool Statistics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Position Type */}
                    <div className="bg-card rounded-lg border p-6">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <TrendingUp className="size-4" />
                            Position Type
                        </div>
                        {isLoading ? (
                            <div className="h-7 bg-muted rounded w-24 animate-pulse"></div>
                        ) : (
                            <p className="text-2xl font-bold">
                                {pool?.positionType === 0 ? 'LONG' : 'SHORT'}
                            </p>
                        )}
                        <p className="text-sm text-muted-foreground mt-2">
                            {pool?.positionType === 0 
                                ? 'Profit when price increases' 
                                : 'Profit when price decreases'}
                        </p>
                    </div>

                    {/* Liquidation Threshold */}
                    <div className="bg-card rounded-lg border p-6">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <Scale className="size-4" />
                            Liquidation Threshold
                        </div>
                        {isLoading ? (
                            <div className="h-7 bg-muted rounded w-24 animate-pulse"></div>
                        ) : (
                            <p className="text-2xl font-bold">
                                {pool?.liquidationThresholdPercentage 
                                    ? (Number(pool.liquidationThresholdPercentage)).toFixed(0) 
                                    : '0'}%
                            </p>
                        )}
                        <p className="text-sm text-muted-foreground mt-2">
                            Positions liquidated below this threshold
                        </p>
                    </div>

                    {/* Max Leverage */}
                    <div className="bg-card rounded-lg border p-6">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <Activity className="size-4" />
                            Max Leverage
                        </div>
                        <p className="text-2xl font-bold">
                            3.00x
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Maximum allowed leverage for positions
                        </p>
                    </div>
                </div>

                {/* My Positions Section */}
                <div className="bg-card rounded-lg border">
                    <div className="p-6 flex justify-between items-center border-b">
                        <h2 className="text-xl font-semibold">My Positions</h2>
                        {isClient && isConnected && (
                            <Button
                                onClick={handleOpenPosition}
                                className="gap-2"
                            >
                                <Plus className="size-4" />
                                Open Position
                            </Button>
                        )}
                    </div>

                    <div className="p-6">
                        {isLoading ? (
                            <div className="space-y-4">
                                {[...Array(2)].map((_, index) => (
                                    <div key={index} className="border rounded-lg p-4 bg-card animate-pulse">
                                        <div className="h-6 w-1/3 bg-muted rounded mb-4"></div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                            <div className="space-y-2">
                                                <div className="h-4 w-16 bg-muted rounded"></div>
                                                <div className="h-5 w-20 bg-muted rounded"></div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="h-4 w-16 bg-muted rounded"></div>
                                                <div className="h-5 w-20 bg-muted rounded"></div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="h-4 w-16 bg-muted rounded"></div>
                                                <div className="h-5 w-20 bg-muted rounded"></div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="h-4 w-16 bg-muted rounded"></div>
                                                <div className="h-5 w-20 bg-muted rounded"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : !isClient ? (
                            // Initial server-rendered state that matches any client-side state
                            <div className="text-center py-8">
                                <p className="text-muted-foreground mb-4">
                                    Loading positions...
                                </p>
                            </div>
                        ) : !isConnected ? (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground mb-4">
                                    Connect your wallet to view and manage your positions
                                </p>
                            </div>
                        ) : poolPositions.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-lg font-medium mb-2">No open positions</p>
                                <p className="text-muted-foreground mb-6">
                                    You don't have any open positions in this pool yet
                                </p>
                                <Button
                                    onClick={handleOpenPosition}
                                    className="gap-2"
                                >
                                    <Plus className="size-4" />
                                    Open First Position
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {poolPositions.map((position: any) => {
                                    // Get pool details from position
                                    const loanTokenSymbol = 
                                        (position.lendingPool?.loanToken?.symbol) || 
                                        (position.pool?.loanToken?.symbol) || 
                                        pool?.loanTokenSymbol || 
                                        'Unknown';
                                    
                                    const collateralTokenSymbol = 
                                        (position.lendingPool?.collateralToken?.symbol) || 
                                        (position.pool?.collateralToken?.symbol) || 
                                        pool?.collateralTokenSymbol || 
                                        'Unknown';
                                    
                                    return (
                                        <MarginCard
                                            key={position.id}
                                            positionAddress={position.address as Address}
                                            lendingPoolAddress={poolAddress}
                                            loanTokenSymbol={loanTokenSymbol}
                                            collateralTokenSymbol={collateralTokenSymbol}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Pool Details */}
                <div className="bg-card rounded-lg border">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold">Pool Details</h2>
                    </div>
                    
                    <div className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <p className="text-sm text-muted-foreground">Loan Token</p>
                                {isLoading ? (
                                    <div className="h-6 bg-muted rounded w-32 mt-1 animate-pulse"></div>
                                ) : (
                                    <p className="font-medium">{pool?.loanTokenSymbol} ({pool?.loanTokenName})</p>
                                )}
                            </div>
                            
                            <div>
                                <p className="text-sm text-muted-foreground">Collateral Token</p>
                                {isLoading ? (
                                    <div className="h-6 bg-muted rounded w-32 mt-1 animate-pulse"></div>
                                ) : (
                                    <p className="font-medium">{pool?.collateralTokenSymbol} ({pool?.collateralTokenName})</p>
                                )}
                            </div>
                            
                            <div>
                                <p className="text-sm text-muted-foreground">Interest Rate</p>
                                {isLoading ? (
                                    <div className="h-6 bg-muted rounded w-16 mt-1 animate-pulse"></div>
                                ) : (
                                    <p className="font-medium">
                                        {interestRate ? (Number(interestRate) / 100).toFixed(2) : '0.00'}%
                                    </p>
                                )}
                            </div>
                            
                            <div>
                                <p className="text-sm text-muted-foreground">Total Supply</p>
                                {isLoading ? (
                                    <div className="h-6 bg-muted rounded w-24 mt-1 animate-pulse"></div>
                                ) : (
                                    <p className="font-medium">
                                        {formatTokenAmount(totalSupplyAssets)} {pool?.loanTokenSymbol}
                                    </p>
                                )}
                            </div>
                            
                            <div>
                                <p className="text-sm text-muted-foreground">Total Borrowed</p>
                                {isLoading ? (
                                    <div className="h-6 bg-muted rounded w-24 mt-1 animate-pulse"></div>
                                ) : (
                                    <p className="font-medium">
                                        {formatTokenAmount(totalBorrowAssets)} {pool?.loanTokenSymbol}
                                    </p>
                                )}
                            </div>
                            
                            <div>
                                <p className="text-sm text-muted-foreground">Utilization Rate</p>
                                {isLoading ? (
                                    <div className="h-6 bg-muted rounded w-16 mt-1 animate-pulse"></div>
                                ) : (
                                    <p className="font-medium">
                                        {formatPercentage(utilizationRate)}
                                    </p>
                                )}
                            </div>
                            
                            <div>
                                <p className="text-sm text-muted-foreground">Creator</p>
                                {isLoading ? (
                                    <div className="h-6 bg-muted rounded w-32 mt-1 animate-pulse"></div>
                                ) : (
                                    <p className="font-medium font-mono text-sm">
                                        {formatAddress(pool?.creator || '0x0000000000000000000000000000000000000000' as Address)}
                                    </p>
                                )}
                            </div>
                            
                            <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                {isLoading ? (
                                    <div className="h-6 bg-muted rounded w-16 mt-1 animate-pulse"></div>
                                ) : (
                                    <p className={`font-medium ${pool?.isActive ? 'text-green-500' : 'text-red-500'}`}>
                                        {pool?.isActive ? 'Active' : 'Inactive'}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}