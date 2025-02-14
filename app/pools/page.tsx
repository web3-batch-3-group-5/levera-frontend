'use client';

import { useRouter } from 'next/navigation';
import { useLendingPoolFactory } from '@/hooks/useLendingPoolFactory';
import { PoolCard } from '@/components/pools/PoolCard';
import { Button } from '@/components/shared/Button';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { Address } from 'viem';

export default function PoolsPage() {
    const router = useRouter();
    const { poolAddresses, pools, isLoading } = useLendingPoolFactory();
    const [searchTerm, setSearchTerm] = useState('');

    const handleSupply = (poolAddress: Address) => {
        router.push(`/pools/${poolAddress}/supply`);
    };

    const handleBorrow = (poolAddress: Address) => {
        router.push(`/pools/${poolAddress}/borrow`);
    };

    // Filter pools based on search term
    const filteredPools = pools.filter((pool, index) =>
        pool.loanTokenSymbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pool.collateralTokenSymbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <main className="flex-1">
            <div className="container mx-auto px-4 lg:px-8 py-8">
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Lending Pools</h1>
                            <p className="text-muted-foreground mt-1">
                                Supply assets to earn interest or borrow against your collateral
                            </p>
                        </div>
                        <Button
                            onClick={() => router.push('/pools/create')}
                            className="gap-2"
                        >
                            <Plus className="size-4" />
                            Create Pool
                        </Button>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search pools by token symbol..."
                            className="w-full pl-10 pr-4 py-2 bg-background border rounded-md"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-card animate-pulse rounded-lg h-64" />
                            ))}
                        </div>
                    ) : !poolAddresses || poolAddresses.length === 0 ? (
                        <div className="text-center py-12 border rounded-lg bg-card">
                            <p className="text-muted-foreground">
                                No lending pools available yet.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredPools.map((pool, index) => {
                                const poolAddress = poolAddresses[index];
                                return (
                                    <PoolCard
                                        key={poolAddress}
                                        poolAddress={poolAddress}
                                        pool={pool}
                                        onSupply={() => handleSupply(poolAddress)}
                                        onBorrow={() => handleBorrow(poolAddress)}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}