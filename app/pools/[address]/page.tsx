'use client';

import { useParams } from 'next/navigation';
import { useLendingPool } from '@/hooks/useLendingPool';
import { useLendingPoolFactory } from '@/hooks/useLendingPoolFactory';
import { Button } from '@/components/shared/Button';
import { ArrowLeft, Wallet, Percent, Database, BarChart3 } from 'lucide-react';
import { Address, formatUnits } from 'viem';
import { useRouter } from 'next/navigation';
import { formatAddress } from '@/lib/utils';
import { formatTokenAmount } from '@/lib/utils/format';

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
        userSupplyShares,
        interestRate,
        isSupplyPending,
        isWithdrawPending,
    } = useLendingPool(poolAddress);

    // Calculate utilization rate
    const utilizationRate = totalSupplyAssets && totalSupplyAssets > 0n
        ? (Number(totalBorrowAssets) / Number(totalSupplyAssets)) * 100
        : 0;

    // Calculate user's balance (userSupplyShares * totalSupplyAssets / totalSupplyShares)
    const userBalance = userSupplyShares && totalSupplyAssets && totalSupplyShares && totalSupplyShares > 0n
        ? (userSupplyShares * totalSupplyAssets) / totalSupplyShares
        : 0n;

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

    return (
        <main className="container mx-auto px-4 py-8">
            <Button
                variant="ghost"
                className="mb-6"
                onClick={() => router.push(`/pools`)}
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

                {/* User Balance Card */}
                <div className="bg-card rounded-lg border p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <Wallet className="size-5 text-primary" />
                        <h3 className="text-lg font-semibold">Your Balance</h3>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
                        <div>
                            <p className="text-3xl font-bold">
                                {formatTokenAmount(userBalance)} {pool.loanTokenSymbol}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={() => router.push(`/pools/${poolAddress}/supply`)}
                                disabled={!pool.isActive || isSupplyPending}
                            >
                                Supply
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => router.push(`/pools/${poolAddress}/withdraw`)}
                                disabled={!pool.isActive || isWithdrawPending || !userBalance || userBalance === 0n}
                            >
                                Withdraw
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Pool Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-card rounded-lg border p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Database className="size-4 text-primary" />
                            <h3 className="text-sm font-medium">Supply</h3>
                        </div>
                        <p className="text-2xl font-bold">
                            {formatTokenAmount(totalSupplyAssets, { tokenAddress: pool.loanToken })} {pool.loanTokenSymbol}
                        </p>
                    </div>

                    <div className="bg-card rounded-lg border p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Database className="size-4 text-primary" />
                            <h3 className="text-sm font-medium">Borrowed</h3>
                        </div>
                        <p className="text-2xl font-bold">
                            {formatTokenAmount(totalBorrowAssets, { tokenAddress: pool.loanToken })} {pool.loanTokenSymbol}
                        </p>
                    </div>

                    <div className="bg-card rounded-lg border p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Percent className="size-4 text-primary" />
                            <h3 className="text-sm font-medium">Interest Rate</h3>
                        </div>
                        <p className="text-2xl font-bold">
                            {interestRate ? (Number(interestRate)).toFixed(2) : '0.00'}%
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Annual percentage rate
                        </p>
                    </div>

                    <div className="bg-card rounded-lg border p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <BarChart3 className="size-4 text-primary" />
                            <h3 className="text-sm font-medium">Utilization</h3>
                        </div>
                        <p className="text-2xl font-bold">
                            {formatPercentage(utilizationRate)}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Borrowed / Supplied
                        </p>
                    </div>
                </div>

                {/* Pool Details */}
                <div className="bg-card rounded-lg border p-6">
                    <h3 className="text-lg font-semibold mb-4">Pool Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6">
                        <div>
                            <p className="text-sm text-muted-foreground">Loan Token</p>
                            <p className="font-medium">{pool.loanTokenName} ({pool.loanTokenSymbol})</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Collateral Token</p>
                            <p className="font-medium">{pool.collateralTokenName} ({pool.collateralTokenSymbol})</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Position Type</p>
                            <p className="font-medium">{pool.positionType === 0 ? 'Long' : 'Short'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Liquidation Threshold</p>
                            <p className="font-medium">
                                {pool.liquidationThresholdPercentage ? (Number(pool.liquidationThresholdPercentage)) : '0.00'}%
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Pool Created</p>
                            <p className="font-medium">Feb 27, 2025</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}