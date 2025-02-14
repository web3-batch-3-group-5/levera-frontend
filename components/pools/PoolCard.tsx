import { Address, formatUnits } from 'viem';
import { formatAddress } from '@/lib/utils';
import { PoolDetails } from '@/config/contracts';
import { Activity, Scale, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLendingPool } from '@/hooks/useLendingPool';

// Helper function to format token amounts
const formatTokenAmount = (amount: bigint | undefined, decimals: number = 18) => {
    if (!amount) return '0.00';
    return Number(formatUnits(amount, decimals)).toLocaleString(undefined, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2
    });
};

// Helper function to format percentage
const formatPercentage = (value: number) => {
    return value.toLocaleString(undefined, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2
    }) + '%';
};

// Calculate Supply APY
const calculateSupplyAPY = (totalBorrowAssets: bigint | undefined, borrowRate: bigint | undefined) => {
    if (!totalBorrowAssets || !borrowRate) return 0;

    // Convert bigint to number for calculation
    const totalBorrow = Number(totalBorrowAssets);
    const rate = Number(borrowRate) / 100; // borrowRate is in basis points (100 = 1%)

    return (totalBorrow * rate) / 100; // divide by 100 to convert from basis points to percentage
};

interface PoolCardProps {
    poolAddress: Address;
    pool: PoolDetails;
}

export function PoolCard({ poolAddress, pool }: PoolCardProps) {
    const router = useRouter();

    const {
        totalSupplyAssets,
        totalBorrowAssets,
        borrowRate,
    } = useLendingPool(poolAddress);

    // Calculate APY
    const supplyAPY = calculateSupplyAPY(totalBorrowAssets, borrowRate);

    // Calculate utilization rate
    const utilizationRate = totalSupplyAssets && totalSupplyAssets > 0n
        ? (Number(totalBorrowAssets) / Number(totalSupplyAssets)) * 100
        : 0;

    const handleClick = () => {
        router.push(`/pools/${poolAddress}`);
    };

    const StatusBadge = () => (
        <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
            pool.isActive
                ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'
        }`}>
      <span className={`size-1.5 rounded-full ${
          pool.isActive ? 'bg-green-500' : 'bg-red-500'
      }`} />
            {pool.isActive ? 'Active' : 'Inactive'}
        </div>
    );

    return (
        <div
            onClick={handleClick}
            className="bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        >
            <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">
                            {pool.loanTokenSymbol}/{pool.collateralTokenSymbol} Pool
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Pool ID: {formatAddress(poolAddress)}
                        </p>
                    </div>
                    <StatusBadge />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Scale className="size-4" />
                            Total Supply
                        </p>
                        <p className="font-medium">
                            {formatTokenAmount(totalSupplyAssets)} {pool.loanTokenSymbol}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Activity className="size-4" />
                            Total Borrowed
                        </p>
                        <p className="font-medium">
                            {formatTokenAmount(totalBorrowAssets)} {pool.loanTokenSymbol}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <TrendingUp className="size-4" />
                            Supply APY
                        </p>
                        <p className="font-medium">
                            {formatPercentage(supplyAPY)}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Utilization</p>
                        <p className="font-medium">
                            {formatPercentage(utilizationRate)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}