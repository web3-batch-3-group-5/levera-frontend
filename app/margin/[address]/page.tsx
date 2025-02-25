'use client';

import { useParams, useRouter } from 'next/navigation';
import { Address } from 'viem';
import { Button } from '@/components/shared/Button';
import { ArrowLeft } from 'lucide-react';
import { useLendingPool } from '@/hooks/useLendingPool';
import { useLendingPoolFactory } from '@/hooks/useLendingPoolFactory';
import { formatTokenAmount } from '@/lib/utils/format';
import { useState } from 'react';
import { useAccount } from 'wagmi';

interface Position {
    id: string;
    netValue: string;
    liquidationPrice: string;
    health: number;
    leverage: number;
}

export default function MarginDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const poolAddress = params.address as Address;
    const { address: userAddress } = useAccount();

    // Sample positions data - this should come from your contract
    const positions: Position[] = [
        { id: '1', netValue: '319.91', liquidationPrice: '0.3300', health: 1.44, leverage: 2.26 },
        { id: '2', netValue: '315.83', liquidationPrice: '0.3300', health: 1.46, leverage: 2.22 },
        { id: '3', netValue: '358.42', liquidationPrice: '0.2700', health: 1.76, leverage: 1.83 },
        { id: '4', netValue: '193.26', liquidationPrice: '0.3100', health: 1.52, leverage: 2.11 },
    ];

    // Get pool details and protocol data
    const { poolAddresses, pools } = useLendingPoolFactory();
    const poolIndex = poolAddresses.findIndex(addr => addr.toLowerCase() === poolAddress.toLowerCase());
    const pool = poolIndex !== -1 ? pools[poolIndex] : undefined;

    const {
        totalSupplyAssets,
        totalBorrowAssets,
        borrowRate,
        userCollateral,
        userBorrowed,
    } = useLendingPool(poolAddress);

    const handleOpenPosition = () => {
        router.push(`/margin/${poolAddress}/trade`);
    };

    return (
        <main className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="gap-2"
                >
                    <ArrowLeft className="size-4" />
                    Back To Pools
                </Button>
            </div>

            <div className="space-y-6">
                {/* Title Section */}
                <div>
                    <h1 className="text-3xl font-bold text-primary">
                        {pool?.loanTokenSymbol}/{pool?.collateralTokenSymbol}
                    </h1>
                </div>

                {/* Positions Section */}
                <div className="bg-card rounded-lg border">
                    <div className="p-4 flex justify-between items-center border-b">
                        <div className="flex items-center gap-4">
                            <h2 className="text-lg font-medium">My Positions</h2>
                        </div>
                        <div className="flex gap-4">
                            <Button onClick={handleOpenPosition}>Open Position</Button>
                        </div>
                    </div>

                    <div className="p-4">
                        {/* Table Header */}
                        <div className="grid grid-cols-5 gap-4 mb-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                POSITION
                            </div>
                            <div className="flex text-right items-center gap-2">
                                NET VALUE
                            </div>
                            <div className="flex items-center gap-2">
                                LIQUIDATION PRICE
                            </div>
                            <div className="flex items-center gap-2">
                                HEALTH
                            </div>
                            <div className="flex items-center gap-2">
                                LEVERAGE
                            </div>
                        </div>

                        {/* Positions List */}
                        {positions.map((position) => (
                            <div
                                key={position.id}
                                className="grid grid-cols-5 gap-4 py-3 border-t first:border-t-0"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="size-2 rounded-full bg-green-500" />
                                    {pool?.loanTokenSymbol}/{pool?.collateralTokenSymbol}
                                </div>
                                <div className="text-right">${position.netValue}</div>
                                <div>${position.liquidationPrice}</div>
                                <div className="text-green-500">{position.health}</div>
                                <div>{position.leverage}X</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* TVL and APY Stats */}
                    <div className="bg-card rounded-lg border p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                    TVL
                                </div>
                                <div className="text-xl font-semibold">
                                    {formatTokenAmount(totalSupplyAssets)} {pool?.loanTokenSymbol}
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                    APY
                                </div>
                                <div className="text-xl font-semibold">
                                    {borrowRate ? (Number(borrowRate) / 100).toFixed(2) : '0.00'}%
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Collateral and Debt Stats */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-card rounded-lg border p-6">
                            <h3 className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                COLLATERAL
                            </h3>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="font-medium">{pool?.collateralTokenSymbol}</span>
                                <span className="text-muted-foreground">
                                    {formatTokenAmount(userCollateral || 0n)}
                                </span>
                            </div>
                        </div>

                        <div className="bg-card rounded-lg border p-6">
                            <h3 className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                DEBT
                            </h3>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="font-medium">{pool?.loanTokenSymbol}</span>
                                <span className="text-muted-foreground">
                                    {formatTokenAmount(userBorrowed || 0n)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}