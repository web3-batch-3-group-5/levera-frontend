// app/pools/page.tsx with focus on rendering pool data
'use client';

import { useRouter } from 'next/navigation';
import { useLendingPoolFactory } from '@/hooks/useLendingPoolFactory';
import { PoolCard } from '@/components/pools/PoolCard';
import { Button } from '@/components/shared/Button';
import { Plus, Search, RefreshCw, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Address } from 'viem';
import { useAccount } from 'wagmi';

export default function PoolsPage() {
    const router = useRouter();
    const { address, isConnected } = useAccount();
    const { poolAddresses, pools, isLoading, error, refresh } =
        useLendingPoolFactory();

    const [searchTerm, setSearchTerm] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isClient, setIsClient] = useState(false);

    // Client-side only check
    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await refresh();
        } catch (err) {
            console.error('Error refreshing pools:', err);
        } finally {
            setTimeout(() => setIsRefreshing(false), 500);
        }
    };

    const handleSupply = (poolAddress: Address) => {
        router.push(`/pools/${poolAddress}/supply`);
    };

    const handleBorrow = (poolAddress: Address) => {
        router.push(`/pools/${poolAddress}/borrow`);
    };

    const handleCreatePool = () => {
        if (!isConnected) {
            return;
        }
        router.push('/pools/create');
    };

    // Filter pools based on search term
    const filteredPools = pools.filter((pool) => {
        return (
            pool.loanTokenSymbol
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            pool.collateralTokenSymbol
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
        );
    });

    return (
        <main className='flex-1'>
            <div className='container mx-auto px-4 lg:px-8 py-8'>
                <div className='flex flex-col gap-6'>
                    {/* Header with Create Pool Button */}
                    <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                        <div>
                            <h1 className='text-3xl font-bold'>
                                Lending Pools
                            </h1>
                            <p className='text-muted-foreground mt-1'>
                                Supply assets to earn interest or borrow against
                                your collateral
                            </p>
                        </div>
                        {isClient ? (
                            <Button
                                onClick={handleCreatePool}
                                className='gap-2'
                                disabled={!isConnected}
                            >
                                <Plus className='size-4' />
                                Create Pool
                            </Button>
                        ) : (
                            <Button className='gap-2'>
                                <Plus className='size-4' />
                                Create Pool
                            </Button>
                        )}
                    </div>

                    {/* Search and Refresh Controls */}
                    <div className='flex flex-col sm:flex-row gap-4'>
                        <div className='relative flex-1'>
                            <Search className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
                            <input
                                type='text'
                                placeholder='Search pools by token symbol...'
                                className='w-full pl-10 pr-4 py-2 bg-background border rounded-md'
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        {isClient ? (
                            <Button
                                variant='outline'
                                className='gap-2'
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                            >
                                <RefreshCw
                                    className={`size-4 ${
                                        isRefreshing ? 'animate-spin' : ''
                                    }`}
                                />
                                {isRefreshing ? 'Refreshing...' : 'Refresh'}
                            </Button>
                        ) : (
                            <Button variant='outline' className='gap-2'>
                                <RefreshCw className='size-4' />
                                Refresh
                            </Button>
                        )}
                    </div>

                    {/* Error State */}
                    {error && (
                        <div className='bg-destructive/10 border border-destructive rounded-lg p-4 flex items-center gap-3'>
                            <AlertTriangle className='size-5 text-destructive flex-shrink-0' />
                            <div>
                                <h3 className='font-medium text-destructive'>
                                    Error loading pools
                                </h3>
                                <p className='text-sm text-muted-foreground'>
                                    {error.message ||
                                        'An error occurred while loading the pools. Please try refreshing.'}
                                </p>
                            </div>
                            <Button
                                variant='outline'
                                size='sm'
                                className='ml-auto'
                                onClick={handleRefresh}
                            >
                                Try Again
                            </Button>
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoading ? (
                        <>
                            <div className='text-sm text-muted-foreground'>
                                Loading pools...
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                                {[...Array(6)].map((_, i) => (
                                    <div
                                        key={i}
                                        className='bg-card animate-pulse rounded-lg h-64 border'
                                    >
                                        <div className='p-6 space-y-4'>
                                            <div className='flex justify-between'>
                                                <div className='h-6 bg-muted rounded w-1/3'></div>
                                                <div className='h-6 bg-muted rounded w-16'></div>
                                            </div>
                                            <div className='space-y-4'>
                                                <div className='grid grid-cols-2 gap-4'>
                                                    <div className='space-y-2'>
                                                        <div className='h-4 bg-muted rounded w-24'></div>
                                                        <div className='h-5 bg-muted rounded w-20'></div>
                                                    </div>
                                                    <div className='space-y-2'>
                                                        <div className='h-4 bg-muted rounded w-24'></div>
                                                        <div className='h-5 bg-muted rounded w-20'></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : !poolAddresses || poolAddresses.length === 0 ? (
                        // Empty State
                        <div className='text-center py-12 border rounded-lg bg-card'>
                            <div className='max-w-md mx-auto space-y-4'>
                                <h3 className='text-lg font-medium'>
                                    No lending pools available yet
                                </h3>
                                <p className='text-muted-foreground'>
                                    {isClient && isConnected
                                        ? 'Be the first to create a lending pool and start earning interest.'
                                        : 'Connect your wallet to create and interact with lending pools.'}
                                </p>
                                {isClient && isConnected && (
                                    <Button
                                        onClick={() =>
                                            router.push('/pools/create')
                                        }
                                        className='gap-2'
                                    >
                                        <Plus className='size-4' />
                                        Create First Pool
                                    </Button>
                                )}
                            </div>
                        </div>
                    ) : (
                        // Pool Grid
                        <div>
                            {/* Filtered Results Count */}
                            {searchTerm && (
                                <div className='mb-4 text-sm text-muted-foreground'>
                                    Showing {filteredPools.length} of{' '}
                                    {pools.length} pools
                                </div>
                            )}

                            {/* No Search Results State */}
                            {searchTerm && filteredPools.length === 0 ? (
                                <div className='text-center py-12 border rounded-lg bg-card'>
                                    <p className='text-muted-foreground'>
                                        No pools match your search for "
                                        {searchTerm}"
                                    </p>
                                    <Button
                                        variant='link'
                                        onClick={() => setSearchTerm('')}
                                    >
                                        Clear search
                                    </Button>
                                </div>
                            ) : (
                                // Pool Cards Grid
                                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                                    {filteredPools.map((pool, index) => {
                                        const poolAddress =
                                            poolAddresses[index];
                                        return (
                                            <PoolCard
                                                key={poolAddress}
                                                poolAddress={poolAddress}
                                                pool={pool}
                                                onSupply={() =>
                                                    handleSupply(poolAddress)
                                                }
                                            />
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
