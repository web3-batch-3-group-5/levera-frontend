'use client';

import { useRouter } from 'next/navigation';
import { useLendingPoolFactory } from '@/hooks/useLendingPoolFactory';
import { usePositionFactory } from '@/hooks/usePositionFactory';
import { useState, useEffect } from 'react';
import { Address } from 'viem';
import { Button } from '@/components/shared/Button';
import { Search, RefreshCw, Plus, Filter, ChevronDown, AlertTriangle } from 'lucide-react';
import { formatTokenAmount } from '@/lib/utils/format';
import { MarginCard } from '@/components/margin/MarginCard';
import { useAccount } from 'wagmi';
import { getConversionRate } from '@/lib/convertPrice';
import { LiquidationCalculator } from '@/lib/health';

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
    const { address: userAddress, isConnected } = useAccount();
    const { poolAddresses, pools, isLoading: isLoadingPools, refresh: refreshPools } = useLendingPoolFactory();
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

    const handlePoolSelect = (poolAddress: Address) => {
        router.push(`/margin/${poolAddress}/trade`);
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

    // Calculate liquidation prices using LiquidationCalculator from health.ts
    const calculateLiquidationPrice = (effectiveCollateral: number, borrowAmount: number, ltp: bigint) => {
        const calculator = new LiquidationCalculator(ltp);
        return calculator.getLiquidationPrice(effectiveCollateral, borrowAmount);
    };

    // Example function to calculate health factor
    const calculateHealthFactor = (effectiveCollateral: number, borrowAmount: number, ltp: bigint) => {
        const calculator = new LiquidationCalculator(ltp);
        return calculator.getHealth(effectiveCollateral, borrowAmount);
    };

    return (
        <main className="flex-1">
            <div className="container mx-auto px-4 lg:px-8 py-8">
                <div className="flex flex-col gap-6">
                    <div>
                        <h1 className="text-3xl font-bold">Margin Trading</h1>
                        <p className="text-muted-foreground mt-1">
                            Trade with leverage using available lending pools
                        </p>
                    </div>

                    {/* Action Bar with Tabs */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-between">
                        <div className="flex gap-2">
                            <Button
                                variant={view === 'pools' ? 'default' : 'outline'}
                                onClick={() => setView('pools')}
                            >
                                Trading Pools
                            </Button>
                            <Button
                                variant={view === 'positions' ? 'default' : 'outline'}
                                onClick={() => setView('positions')}
                            >
                                My Positions
                            </Button>
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

                            <Button
                                variant="outline"
                                className="gap-2"
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                            >
                                <RefreshCw className={`size-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                {isRefreshing ? 'Refreshing...' : 'Refresh'}
                            </Button>
                        </div>
                    </div>

                    {/* Filters Row (conditionally shown) */}
                    {showFilters && (
                        <div className="bg-card border rounded-lg p-4 space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="w-full sm:w-auto flex-1">
                                    <label className="text-sm text-muted-foreground mb-1 block">
                                        Search
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                        <input
                                            type="text"
                                            placeholder="Search by token symbol..."
                                            className="w-full pl-10 pr-4 py-2 bg-background border rounded-md"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>

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
                            </div>
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
                                        <div key={i} className="bg-card animate-pulse rounded-lg h-64 border" />
                                    ))}
                                </div>
                            ) : !poolAddresses || poolAddresses.length === 0 ? (
                                <div className="text-center py-12 border rounded-lg bg-card">
                                    <p className="text-muted-foreground">
                                        No margin trading pools available.
                                    </p>
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
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredPools.map((pool, index) => {
                                        const poolAddress = poolAddresses[index];
                                        return (
                                            <div
                                                key={poolAddress}
                                                onClick={() => handlePoolSelect(poolAddress)}
                                                className="bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                            >
                                                <div className="p-6 space-y-4">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <h3 className="text-lg font-semibold">
                                                                {pool.loanTokenSymbol}/{pool.collateralTokenSymbol}
                                                            </h3>
                                                            <p className="text-sm text-muted-foreground">
                                                                Margin Trading Pool
                                                            </p>
                                                        </div>
                                                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            pool.isActive
                                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
                                                                : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'
                                                        }`}>
                                                            {pool.isActive ? 'Active' : 'Inactive'}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <p className="text-sm text-muted-foreground">
                                                                Loan Token
                                                            </p>
                                                            <p className="font-medium">
                                                                {pool.loanTokenSymbol}
                                                            </p>
                                                        </div>

                                                        <div className="space-y-1">
                                                            <p className="text-sm text-muted-foreground">
                                                                Collateral Token
                                                            </p>
                                                            <p className="font-medium">
                                                                {pool.collateralTokenSymbol}
                                                            </p>
                                                        </div>

                                                        <div className="space-y-1">
                                                            <p className="text-sm text-muted-foreground">
                                                                Position Type
                                                            </p>
                                                            <p className="font-medium">
                                                                {pool.positionType === 0 ? 'LONG' : 'SHORT'}
                                                            </p>
                                                        </div>

                                                        <div className="space-y-1">
                                                            <p className="text-sm text-muted-foreground">
                                                                Max Leverage
                                                            </p>
                                                            <p className="font-medium">
                                                                3x
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <Button
                                                        className="w-full"
                                                        variant="secondary"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handlePoolSelect(poolAddress);
                                                        }}
                                                    >
                                                        Create Position
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}