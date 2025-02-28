'use client';

import { useRouter } from 'next/navigation';
import { useLendingPoolFactory } from '@/hooks/useLendingPoolFactory';
import { usePositionFactory } from '@/hooks/usePositionFactory';
import { useState, useEffect } from 'react';
import { Address } from 'viem';
import { Button } from '@/components/shared/Button';
import { Search, RefreshCw, Filter, ChevronDown, AlertTriangle, Plus } from 'lucide-react';
import { MarginCard } from '@/components/margin/MarginCard';
import { MarginPoolCard } from '@/components/margin/MarginPoolCard';
import { useAccount } from 'wagmi';

// Type definitions to handle potential missing properties
interface SafePosition {
    id: string;
    address?: Address;
    // Add safe access to nested properties
    pool?: {
        id?: string;
        address?: Address;
        loanToken?: {
            symbol?: string;
            decimals?: number;
        };
        collateralToken?: {
            symbol?: string;
            decimals?: number;
        };
    };
    // Alternative structure that might be in your data
    lendingPool?: {
        id?: string;
        address?: Address;
        loanToken?: {
            symbol?: string;
            decimals?: number;
        };
        collateralToken?: {
            symbol?: string;
            decimals?: number;
        };
    };
}

export default function MarginPoolsPage() {
    const router = useRouter();
    const { isConnected } = useAccount();
    const { poolAddresses, pools, isLoading: isLoadingPools, refresh: refreshPools, error: poolsError } = useLendingPoolFactory();
    const { userPositions, isLoading: isLoadingPositions, refresh: refreshPositions } = usePositionFactory();

    const [searchTerm, setSearchTerm] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [view, setView] = useState<'positions' | 'pools'>('pools'); // Default to pools view
    const [showFilters, setShowFilters] = useState(false);
    const [positionType, setPositionType] = useState<'all' | 'long' | 'short'>('all');
    const [isClient, setIsClient] = useState(false);

    // Fix for hydration mismatch - only set isClient to true after component mounts
    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await Promise.all([refreshPools(), refreshPositions()]);
        setTimeout(() => setIsRefreshing(false), 500);
    };

    // Filter pools based on search term and position type
    const filteredPools = pools.filter((pool) => {
        const matchesSearch =
            pool.loanTokenSymbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pool.collateralTokenSymbol.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType =
            positionType === 'all' ||
            (positionType === 'long' && pool.positionType === 0) ||
            (positionType === 'short' && pool.positionType === 1);

        return matchesSearch && matchesType;
    });

    // Helper function to safely access position loan and collateral token symbols
    const getPositionTokens = (position: SafePosition) => {
        // Try to get data from position.lendingPool first (as used in your code)
        if (position.lendingPool?.loanToken?.symbol && position.lendingPool?.collateralToken?.symbol) {
            return {
                loanTokenSymbol: position.lendingPool.loanToken.symbol,
                collateralTokenSymbol: position.lendingPool.collateralToken.symbol,
                lendingPoolAddress: position.lendingPool.address as Address
            };
        }
        
        // Fall back to position.pool if lendingPool is not available
        if (position.pool?.loanToken?.symbol && position.pool?.collateralToken?.symbol) {
            return {
                loanTokenSymbol: position.pool.loanToken.symbol,
                collateralTokenSymbol: position.pool.collateralToken.symbol,
                lendingPoolAddress: position.pool.address as Address
            };
        }
        
        // If neither is available, return fallback values
        return {
            loanTokenSymbol: "Unknown",
            collateralTokenSymbol: "Unknown",
            lendingPoolAddress: "0x0000000000000000000000000000000000000000" as Address
        };
    };

    // Filter positions with safe access to properties
    const filteredPositions = userPositions.filter((position: SafePosition) => {
        if (!searchTerm) return true;
        
        const { loanTokenSymbol, collateralTokenSymbol } = getPositionTokens(position);
        
        const matchesSearch = 
            loanTokenSymbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
            collateralTokenSymbol.toLowerCase().includes(searchTerm.toLowerCase());
            
        return matchesSearch;
    });

    // Loading states
    const isLoading = isLoadingPools || isLoadingPositions;
    const error = poolsError;

    return (
        <main className="flex-1">
            <div className="container mx-auto px-4 lg:px-8 py-8">
                <div className="flex flex-col gap-6">
                    {/* Header with Title */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold">Margin Trading</h1>
                            <p className="text-muted-foreground mt-1">
                                Trade with leverage using available lending pools
                            </p>
                        </div>
                        {isClient && view === 'positions' && isConnected && (
                            <Button
                                onClick={() => setView('pools')}
                                className="gap-2"
                            >
                                <Plus className="size-4" />
                                New Position
                            </Button>
                        )}
                    </div>

                    {/* Search and Filters Controls */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder={view === 'pools' ? "Search pools by token symbol..." : "Search positions by token symbol..."}
                                className="w-full pl-10 pr-4 py-2 bg-background border rounded-md"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="gap-1"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <Filter className="size-4" />
                                Filters
                                <ChevronDown className="size-4" />
                            </Button>

                            {isClient ? (
                                <Button
                                    variant="outline"
                                    className="gap-2"
                                    onClick={handleRefresh}
                                    disabled={isRefreshing}
                                >
                                    <RefreshCw className={`size-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                                </Button>
                            ) : (
                                <Button variant="outline" className="gap-2">
                                    <RefreshCw className="size-4" />
                                    Refresh
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* View Tabs */}
                    <div className="flex gap-2 border-b pb-2">
                        <Button
                            variant={view === 'pools' ? 'default' : 'ghost'}
                            onClick={() => setView('pools')}
                            className="gap-2"
                        >
                            Trading Pools
                        </Button>
                        <Button
                            variant={view === 'positions' ? 'default' : 'ghost'}
                            onClick={() => setView('positions')}
                            className="gap-2"
                        >
                            My Positions
                        </Button>
                    </div>

                    {/* Filters Row (conditionally shown) */}
                    {showFilters && (
                        <div className="bg-card rounded-lg border p-4 space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                {view === 'pools' && (
                                    <div className="w-full sm:w-auto">
                                        <label className="text-sm text-muted-foreground mb-1 block">
                                            Position Type
                                        </label>
                                        <select
                                            className="w-full py-2 px-3 bg-background border rounded-md"
                                            value={positionType}
                                            onChange={(e) => setPositionType(e.target.value as 'all' | 'long' | 'short')}
                                        >
                                            <option value="all">All Types</option>
                                            <option value="long">Long</option>
                                            <option value="short">Short</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="bg-destructive/10 border border-destructive rounded-lg p-4 flex items-center gap-3">
                            <AlertTriangle className="size-5 text-destructive flex-shrink-0" />
                            <div>
                                <h3 className="font-medium text-destructive">Error loading pools</h3>
                                <p className="text-sm text-muted-foreground">
                                    {error.message || 'An error occurred while loading the pools. Please try refreshing.'}
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="ml-auto"
                                onClick={handleRefresh}
                            >
                                Try Again
                            </Button>
                        </div>
                    )}

                    {/* My Positions View */}
                    {view === 'positions' && (
                        <div className="space-y-4">
                            {isLoading ? (
                                <div className="space-y-4">
                                    {[...Array(3)].map((_, index) => (
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
                                            <div className="h-9 w-full bg-muted rounded"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : filteredPositions.length === 0 ? (
                                <div className="text-center py-12 border rounded-lg bg-card">
                                    <div className="max-w-md mx-auto space-y-4">
                                        <h3 className="text-lg font-medium">No open positions</h3>
                                        <p className="text-muted-foreground">
                                            {!isClient || !isConnected
                                                ? "Connect your wallet to view your positions"
                                                : "You don't have any open positions yet. Start trading to create positions."}
                                        </p>
                                        {isClient && isConnected && (
                                            <Button
                                                onClick={() => setView('pools')}
                                                className="gap-2"
                                            >
                                                <Plus className="size-4" />
                                                Open a Position
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Search Result Count */}
                                    {searchTerm && (
                                        <div className="text-sm text-muted-foreground">
                                            Showing {filteredPositions.length} of {userPositions.length} positions
                                        </div>
                                    )}
                                    
                                    {filteredPositions.map((position: SafePosition) => {
                                        const { 
                                            loanTokenSymbol, 
                                            collateralTokenSymbol,
                                            lendingPoolAddress
                                        } = getPositionTokens(position);
                                        
                                        return (
                                            <MarginCard
                                                key={position.id}
                                                positionAddress={position.address as Address || '0x0000000000000000000000000000000000000000' as Address}
                                                lendingPoolAddress={lendingPoolAddress}
                                                loanTokenSymbol={loanTokenSymbol}
                                                collateralTokenSymbol={collateralTokenSymbol}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Trading Pools View */}
                    {view === 'pools' && (
                        <div>
                            {isLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="bg-card animate-pulse rounded-lg h-64 border">
                                            <div className="p-6 space-y-4">
                                                <div className="flex justify-between">
                                                    <div className="h-6 bg-muted rounded w-1/3"></div>
                                                    <div className="h-6 bg-muted rounded w-16"></div>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <div className="h-4 bg-muted rounded w-24"></div>
                                                            <div className="h-5 bg-muted rounded w-20"></div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <div className="h-4 bg-muted rounded w-24"></div>
                                                            <div className="h-5 bg-muted rounded w-20"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : !poolAddresses || poolAddresses.length === 0 ? (
                                <div className="text-center py-12 border rounded-lg bg-card">
                                    <div className="max-w-md mx-auto space-y-4">
                                        <h3 className="text-lg font-medium">No margin trading pools available</h3>
                                        <p className="text-muted-foreground">
                                            There are no available margin trading pools yet.
                                        </p>
                                    </div>
                                </div>
                            ) : filteredPools.length === 0 ? (
                                <div className="text-center py-12 border rounded-lg bg-card">
                                    <p className="text-muted-foreground">
                                        No pools match your search criteria.
                                    </p>
                                    <Button
                                        variant="link"
                                        onClick={() => {
                                            setSearchTerm('');
                                            setPositionType('all');
                                        }}
                                    >
                                        Clear filters
                                    </Button>
                                </div>
                            ) : (
                                <div>
                                    {/* Filtered Results Count */}
                                    {searchTerm && (
                                        <div className="mb-4 text-sm text-muted-foreground">
                                            Showing {filteredPools.length} of {pools.length} pools
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredPools.map((pool, index) => {
                                            const poolAddress = poolAddresses[index];
                                            return (
                                                <MarginPoolCard
                                                    key={poolAddress}
                                                    poolAddress={poolAddress}
                                                    pool={pool}
                                                    onTrade={() => router.push(`/margin/${poolAddress}/trade`)}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}