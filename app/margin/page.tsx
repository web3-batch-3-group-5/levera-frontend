'use client';

import { useRouter } from 'next/navigation';
import { useLendingPoolFactory } from '@/hooks/useLendingPoolFactory';
import { useState } from 'react';
import { Address } from 'viem';
import { Button } from '@/components/shared/Button';
import { Search } from 'lucide-react';

export default function MarginPoolsPage() {
    const router = useRouter();
    const { poolAddresses, pools, isLoading } = useLendingPoolFactory();
    const [searchTerm, setSearchTerm] = useState('');

    const handlePoolSelect = (poolAddress: Address) => {
        router.push(`/margin/${poolAddress}/trade`);
    };

    // Filter pools based on search term
    const filteredPools = pools.filter((pool) =>
        pool.loanTokenSymbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pool.collateralTokenSymbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                                No margin trading pools available.
                            </p>
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
                                                        Max Leverage
                                                    </p>
                                                    <p className="font-medium">
                                                        10x
                                                    </p>
                                                </div>

                                                <div className="space-y-1">
                                                    <p className="text-sm text-muted-foreground">
                                                        Minimum Collateral
                                                    </p>
                                                    <p className="font-medium">
                                                        100 {pool.collateralTokenSymbol}
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
                                                Trade Now
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}


//