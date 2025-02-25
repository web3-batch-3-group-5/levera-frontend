'use client';

import { useParams } from 'next/navigation';
import { useLendingPool } from '@/hooks/useLendingPool';
import { useLendingPoolFactory } from '@/hooks/useLendingPoolFactory';
import { Button } from '@/components/shared/Button';
import { ArrowLeft } from 'lucide-react';
import { Address, formatUnits } from 'viem';
import { useRouter } from 'next/navigation';
import { formatAddress } from '@/lib/utils';

// Helper function to format decimals consistently
const formatTokenAmount = (amount: bigint | undefined, decimals: number = 18) => {
    if (!amount) return '0.00';
    return Number(formatUnits(amount, decimals)).toLocaleString(undefined, {
        maximumFractionDigits: 6,
        minimumFractionDigits: 2
    });
};

const formatPercentage = (value: number) => {
    return value.toLocaleString(undefined, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2
    }) + '%';
};

export default function PoolDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const poolAddress = params.address as Address;

    const { poolAddresses, pools } = useLendingPoolFactory();
    const poolIndex = poolAddresses.findIndex(addr => addr.toLowerCase() === poolAddress.toLowerCase());
    const pool = poolIndex !== -1 ? pools[poolIndex] : undefined;

    const {
        totalSupplyAssets,
        totalSupplyShares,
        totalBorrowAssets,
        totalBorrowShares,
        borrowRate,
        isSupplyPending,
        isWithdrawPending,
    } = useLendingPool(poolAddress);

    if (!pool) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Pool not found</h1>
                    <Button onClick={() => router.back()}>
                        <ArrowLeft className="size-4 mr-2" />
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    // Calculate utilization rate
    const utilizationRate = totalSupplyAssets && totalSupplyAssets > 0n
        ? (Number(totalBorrowAssets) / Number(totalSupplyAssets)) * 100
        : 0;

    return (
        <main className="container mx-auto px-4 py-8">
            <Button
                variant="ghost"
                className="mb-6"
                onClick={() => router.back()}
            >
                <ArrowLeft className="size-4 mr-2" />
                Back to Pools
            </Button>

            <div className="space-y-8">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">
                            {pool.loanTokenSymbol}/{pool.collateralTokenSymbol} Pool
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Pool Address: {formatAddress(poolAddress)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Created by {formatAddress(pool.creator)}
                        </p>
                    </div>
                    <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                        pool.isActive
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'
                    }`}>
                        {pool.isActive ? 'Active' : 'Inactive'}
                    </div>
                </div>

                {/* Pool Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-card rounded-lg border p-6">
                        <h3 className="text-sm text-muted-foreground mb-2">Total Supply</h3>
                        <p className="text-2xl font-bold">
                            {formatTokenAmount(totalSupplyAssets)} {pool.loanTokenSymbol}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Shares: {formatTokenAmount(totalSupplyShares)}
                        </p>
                    </div>

                    <div className="bg-card rounded-lg border p-6">
                        <h3 className="text-sm text-muted-foreground mb-2">Total Borrow</h3>
                        <p className="text-2xl font-bold">
                            {formatTokenAmount(totalBorrowAssets)} {pool.loanTokenSymbol}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Shares: {formatTokenAmount(totalBorrowShares)}
                        </p>
                    </div>

                    <div className="bg-card rounded-lg border p-6">
                        <h3 className="text-sm text-muted-foreground mb-2">Borrow Rate</h3>
                        <p className="text-2xl font-bold">
                            {borrowRate ? formatPercentage(Number(borrowRate)) : '0.00%'}
                        </p>
                    </div>

                    <div className="bg-card rounded-lg border p-6">
                        <h3 className="text-sm text-muted-foreground mb-2">Utilization</h3>
                        <p className="text-2xl font-bold">
                            {formatPercentage(utilizationRate)}
                        </p>
                    </div>
                </div>

                {/* Token Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-card rounded-lg border p-6">
                        <h3 className="text-lg font-semibold mb-4">Loan Token</h3>
                        <div className="space-y-2">
                            <p className="text-sm">
                                <span className="text-muted-foreground">Name:</span> {pool.loanTokenName}
                            </p>
                            <p className="text-sm">
                                <span className="text-muted-foreground">Symbol:</span> {pool.loanTokenSymbol}
                            </p>
                            <p className="text-sm">
                                <span className="text-muted-foreground">Address:</span>{' '}
                                <code className="text-xs bg-muted px-1 py-0.5 rounded">
                                    {formatAddress(pool.loanToken)}
                                </code>
                            </p>
                        </div>
                    </div>

                    <div className="bg-card rounded-lg border p-6">
                        <h3 className="text-lg font-semibold mb-4">Collateral Token</h3>
                        <div className="space-y-2">
                            <p className="text-sm">
                                <span className="text-muted-foreground">Name:</span> {pool.collateralTokenName}
                            </p>
                            <p className="text-sm">
                                <span className="text-muted-foreground">Symbol:</span> {pool.collateralTokenSymbol}
                            </p>
                            <p className="text-sm">
                                <span className="text-muted-foreground">Address:</span>{' '}
                                <code className="text-xs bg-muted px-1 py-0.5 rounded">
                                    {formatAddress(pool.collateralToken)}
                                </code>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <Button
                        size="lg"
                        onClick={() => router.push(`/pools/${poolAddress}/supply`)}
                        disabled={!pool.isActive || isSupplyPending}
                        className="flex-1"
                    >
                        Supply
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        onClick={() => router.push(`/pools/${poolAddress}/borrow`)}
                        disabled={!pool.isActive || isWithdrawPending}
                        className="flex-1"
                    >
                        Withdraw
                    </Button>
                </div>
            </div>
        </main>
    );
}