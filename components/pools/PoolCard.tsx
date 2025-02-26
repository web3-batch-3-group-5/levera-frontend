import { Address } from 'viem';
import { formatAddress } from '@/lib/utils';
import { Activity, Scale, TrendingUp, Info, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLendingPool } from '@/hooks/useLendingPool';
import { Button } from '@/components/shared/Button';
import { useState } from 'react';
import { formatTokenAmount } from '@/lib/utils/format';
import { PoolDetails } from '@/lib/types/contracts';

// Helper function to format percentage
const formatPercentage = (value: number) => {
    return (
        value.toLocaleString(undefined, {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
        }) + '%'
    );
};

interface PoolCardProps {
    poolAddress: Address;
    pool: PoolDetails;
    onSupply?: (poolAddress: Address) => void;
    // Removed onBorrow
}

export function PoolCard({ poolAddress, pool, onSupply }: PoolCardProps) {
    const router = useRouter();
    const [isExpanded, setIsExpanded] = useState(false);

    // Fetch real pool data
    const {
        totalSupplyAssets,
        totalBorrowAssets,
        interestRate,
        error: poolDataError,
    } = useLendingPool(poolAddress);

    // Loading state derived from data availability
    const isLoadingPoolData =
        !totalSupplyAssets &&
        !totalBorrowAssets &&
        !interestRate &&
        !poolDataError;

    // Calculate utilization rate
    const utilizationRate =
        totalSupplyAssets && totalSupplyAssets > 0n
            ? (Number(totalBorrowAssets || 0n) / Number(totalSupplyAssets)) *
              100
            : 0;

    // Calculate supply APY - in a real implementation, this would use actual earnings data
    const supplyAPY = interestRate
        ? (Number(interestRate) / 100) * (utilizationRate / 100)
        : 0;

    const handleClick = () => {
        router.push(`/pools/${poolAddress}`);
    };

    const handleSupply = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onSupply) {
            onSupply(poolAddress);
        } else {
            router.push(`/pools/${poolAddress}/supply`);
        }
    };

    const handleWithdraw = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.push(`/pools/${poolAddress}/withdraw`);
    };

    const handleTrade = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.push(`/margin/${poolAddress}/trade`);
    };

    const handleToggleExpand = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    const StatusBadge = () => (
        <div
            className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                pool.isActive
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'
            }`}
        >
            <span
                className={`size-1.5 rounded-full ${
                    pool.isActive ? 'bg-green-500' : 'bg-red-500'
                }`}
            />
            {pool.isActive ? 'Active' : 'Inactive'}
        </div>
    );

    if (poolDataError) {
        return (
            <div className='bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow'>
                <div className='p-6 space-y-4'>
                    <div className='flex items-start justify-between'>
                        <div>
                            <h3 className='text-lg font-semibold'>
                                {pool.loanTokenSymbol}/
                                {pool.collateralTokenSymbol} Pool
                            </h3>
                            <p className='text-sm text-muted-foreground'>
                                Pool ID: {formatAddress(poolAddress)}
                            </p>
                        </div>
                        <StatusBadge />
                    </div>

                    <div className='flex items-center gap-2 text-destructive'>
                        <AlertTriangle className='size-4' />
                        <span className='text-sm'>Error loading pool data</span>
                    </div>

                    <Button
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/pools/${poolAddress}`);
                        }}
                        className='w-full'
                        variant='outline'
                    >
                        View Details
                    </Button>
                </div>
            </div>
        );
    }

    // Base content (shown in both collapsed and expanded views)
    const baseContent = (
        <>
            <div className='flex items-start justify-between'>
                <div>
                    <h3 className='text-lg font-semibold'>
                        {pool.loanTokenSymbol}/{pool.collateralTokenSymbol} Pool
                    </h3>
                    <p className='text-sm text-muted-foreground'>
                        Pool ID: {formatAddress(poolAddress)}
                    </p>
                </div>
                <StatusBadge />
            </div>

            <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-1'>
                    <p className='text-sm text-muted-foreground flex items-center gap-1'>
                        <Scale className='size-4' />
                        Total Supply
                    </p>
                    {isLoadingPoolData ? (
                        <div className='h-5 bg-muted/50 rounded w-24 animate-pulse'></div>
                    ) : (
                        <p className='font-medium'>
                            {formatTokenAmount(totalSupplyAssets)}{' '}
                            {pool.loanTokenSymbol}
                        </p>
                    )}
                </div>

                <div className='space-y-1'>
                    <p className='text-sm text-muted-foreground flex items-center gap-1'>
                        <Activity className='size-4' />
                        Total Borrowed
                    </p>
                    {isLoadingPoolData ? (
                        <div className='h-5 bg-muted/50 rounded w-24 animate-pulse'></div>
                    ) : (
                        <p className='font-medium'>
                            {formatTokenAmount(totalBorrowAssets)}{' '}
                            {pool.loanTokenSymbol}
                        </p>
                    )}
                </div>

                <div className='space-y-1'>
                    <p className='text-sm text-muted-foreground flex items-center gap-1'>
                        <TrendingUp className='size-4' />
                        Supply APY
                    </p>
                    {isLoadingPoolData ? (
                        <div className='h-5 bg-muted/50 rounded w-16 animate-pulse'></div>
                    ) : (
                        <p className='font-medium'>
                            {formatPercentage(supplyAPY)}
                        </p>
                    )}
                </div>

                <div className='space-y-1'>
                    <p className='text-sm text-muted-foreground'>Utilization</p>
                    {isLoadingPoolData ? (
                        <div className='h-5 bg-muted/50 rounded w-16 animate-pulse'></div>
                    ) : (
                        <p className='font-medium'>
                            {formatPercentage(utilizationRate)}
                        </p>
                    )}
                </div>
            </div>
        </>
    );

    // Expanded content (only shown when expanded)
    const expandedContent = isExpanded && (
        <div className='mt-4 pt-4 border-t'>
            <div className='grid grid-cols-2 gap-4 mb-4'>
                <div className='space-y-1'>
                    <p className='text-sm text-muted-foreground'>
                        Interest Rate
                    </p>
                    <p className='font-medium'>
                        {interestRate
                            ? Number(interestRate).toFixed(2)
                            : '0.00'}
                        %
                    </p>
                </div>

                <div className='space-y-1'>
                    <p className='text-sm text-muted-foreground'>
                        Liquidation Threshold
                    </p>
                    <p className='font-medium'>
                        {pool.liquidationThresholdPercentage
                            ? Number(
                                  pool.liquidationThresholdPercentage
                              ).toFixed(2)
                            : '0.00'}
                        %
                    </p>
                </div>

                <div className='space-y-1'>
                    <p className='text-sm text-muted-foreground'>
                        Position Type
                    </p>
                    <p className='font-medium'>
                        {pool.positionType === 0 ? 'Long' : 'Short'}
                    </p>
                </div>

                <div className='space-y-1'>
                    <p className='text-sm text-muted-foreground'>Creator</p>
                    <p className='font-medium'>{formatAddress(pool.creator)}</p>
                </div>
            </div>

            <div className='flex gap-2 mt-4'>
                <Button
                    className='flex-1'
                    onClick={handleSupply}
                    disabled={!pool.isActive}
                >
                    Supply
                </Button>
                <Button
                    className='flex-1'
                    variant='outline'
                    onClick={handleWithdraw}
                    disabled={!pool.isActive}
                >
                    Withdraw
                </Button>
                <Button
                    className='flex-1'
                    variant='secondary'
                    onClick={handleTrade}
                    disabled={!pool.isActive}
                >
                    Trade
                </Button>
            </div>
        </div>
    );

    const collapsedButtons = !isExpanded && (
        <div className='flex gap-2'>
            <Button
                variant='outline'
                size='sm'
                onClick={handleSupply}
                disabled={!pool.isActive}
            >
                Supply
            </Button>
            <Button
                variant='secondary'
                size='sm'
                onClick={handleTrade}
                disabled={!pool.isActive}
            >
                Trade
            </Button>
        </div>
    );

    return (
        <div
            onClick={handleClick}
            className='bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer'
        >
            <div className='p-6 space-y-4'>
                {baseContent}

                {expandedContent}

                <div className='flex items-center justify-between mt-4'>
                    <Button
                        variant='ghost'
                        size='sm'
                        onClick={handleToggleExpand}
                        className='text-xs text-muted-foreground hover:text-foreground flex items-center gap-1'
                    >
                        <Info className='size-3.5' />
                        {isExpanded ? 'Show less' : 'Show more'}
                    </Button>

                    {collapsedButtons}
                </div>
            </div>
        </div>
    );
}
