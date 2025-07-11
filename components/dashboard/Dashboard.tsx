'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/shared/Button';
import { ArrowRight, TrendingUp, Coins, LineChart, BarChart3 } from 'lucide-react';
import { useLendingPoolFactory } from '@/hooks/useLendingPoolFactory';
import { usePositionFactory } from '@/hooks/usePositionFactory';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { useAccount } from 'wagmi';

export function Dashboard() {
  const router = useRouter();
  const { pools, isLoading: isLoadingPools, poolAddresses } = useLendingPoolFactory();
  const { userPositions, isLoading: isLoadingPositions } = usePositionFactory();
  const { isConnected } = useAccount();

  // Calculate some statistics to show on dashboard
  const totalPools = pools.length;
  const activePools = pools.filter(pool => pool.isActive).length;
  const userPositionsCount = userPositions.length;

  // Quick stats
  const stats = [
    {
      label: 'Total Lending Pools',
      value: isLoadingPools ? '...' : totalPools,
      change: '+5 this week',
      icon: <Coins className='size-5 text-yellow-500' />,
      color: 'bg-yellow-50 dark:bg-yellow-950/30',
      onClick: () => router.push('/pools'),
    },
    {
      label: 'Active Pools',
      value: isLoadingPools ? '...' : activePools,
      change: '92% of total',
      icon: <BarChart3 className='size-5 text-blue-500' />,
      color: 'bg-blue-50 dark:bg-blue-950/30',
      onClick: () => router.push('/pools'),
    },
    {
      label: 'Your Open Positions',
      value: isLoadingPositions ? '...' : userPositionsCount,
      change: isConnected ? 'Manage positions' : 'Connect wallet to view',
      icon: <TrendingUp className='size-5 text-green-500' />,
      color: 'bg-green-50 dark:bg-green-950/30',
      onClick: () => router.push('/margin'),
    },
    {
      label: 'Avg. Interest Rate',
      value: '8.2%',
      change: '-0.5% from last week',
      icon: <LineChart className='size-5 text-purple-500' />,
      color: 'bg-purple-50 dark:bg-purple-950/30',
      onClick: () => router.push('/pools'),
    },
  ];

  return (
    <div className='space-y-8'>
      {/* Platform stats */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {stats.map((stat, i) => (
          <div
            key={i}
            className={`${stat.color} border rounded-lg p-6 cursor-pointer hover:shadow-md transition-shadow`}
            onClick={stat.onClick}
          >
            <div className='flex justify-between items-start'>
              <div>
                <p className='text-sm text-muted-foreground'>{stat.label}</p>
                <p className='text-2xl font-bold mt-1'>{stat.value}</p>
                <p className='text-xs text-muted-foreground mt-1'>{stat.change}</p>
              </div>
              <div className='p-2 bg-white dark:bg-black/20 rounded-md'>{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Featured Pools Section */}
      <div>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-semibold'>Featured Lending Pools</h2>
          <Button variant='ghost' className='text-sm gap-1' onClick={() => router.push('/pools')}>
            View All Pools <ArrowRight className='size-3.5' />
          </Button>
        </div>

        {isLoadingPools ? (
          <LoadingSkeleton variant='card' count={3} />
        ) : pools.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {pools.slice(0, 3).map((pool, index) => (
              <div
                key={index}
                className='bg-card rounded-lg border p-6 space-y-4 cursor-pointer hover:shadow-md transition-shadow'
                onClick={() => router.push(`/pools/${poolAddresses[index]}`)}
              >
                <div className='flex justify-between items-center'>
                  <h3 className='font-semibold'>
                    {pool.loanTokenSymbol}/{pool.collateralTokenSymbol}
                  </h3>
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full ${
                      pool.positionType === 0
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'
                    }`}
                  >
                    {pool.positionType === 0 ? 'LONG' : 'SHORT'}
                  </span>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-xs text-muted-foreground'>Interest Rate</p>
                    <p className='font-medium'>{Number(pool.interestRate).toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className='text-xs text-muted-foreground'>Liquidation Threshold</p>
                    <p className='font-medium'>{Number(pool.liquidationThresholdPercentage).toFixed(0)}%</p>
                  </div>
                </div>

                <Button
                  variant='default'
                  size='sm'
                  className='w-full'
                  onClick={e => {
                    e.stopPropagation();
                    router.push(`/margin/${poolAddresses[index]}/trade`);
                  }}
                >
                  <TrendingUp className='size-3.5 mr-1' /> Trade Now
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className='text-center py-12 border rounded-lg bg-card'>
            <p className='text-muted-foreground'>No lending pools available yet.</p>
            <Button variant='link' onClick={() => router.push('/pools/create')}>
              Create first pool
            </Button>
          </div>
        )}
      </div>

      {/* Quick Actions Section */}
      <div className='bg-card rounded-lg border p-6'>
        <h2 className='text-xl font-semibold mb-4'>Quick Actions</h2>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          <Button
            variant='outline'
            className='h-auto p-4 flex flex-col items-center text-center gap-2'
            onClick={() => router.push('/pools/create')}
          >
            <Coins className='size-6' />
            <div>
              <p className='font-medium'>Create Pool</p>
              <p className='text-xs text-muted-foreground'>Set up a new lending pool</p>
            </div>
          </Button>

          <Button
            variant='outline'
            className='h-auto p-4 flex flex-col items-center text-center gap-2'
            onClick={() => router.push('/pools')}
          >
            <BarChart3 className='size-6' />
            <div>
              <p className='font-medium'>Supply Assets</p>
              <p className='text-xs text-muted-foreground'>Earn interest on your assets</p>
            </div>
          </Button>

          <Button
            variant='outline'
            className='h-auto p-4 flex flex-col items-center text-center gap-2'
            onClick={() => router.push('/margin')}
          >
            <TrendingUp className='size-6' />
            <div>
              <p className='font-medium'>Open Position</p>
              <p className='text-xs text-muted-foreground'>Start margin trading</p>
            </div>
          </Button>

          <Button
            variant='outline'
            className='h-auto p-4 flex flex-col items-center text-center gap-2'
            onClick={() => router.push('/margin')}
          >
            <LineChart className='size-6' />
            <div>
              <p className='font-medium'>Manage Positions</p>
              <p className='text-xs text-muted-foreground'>View and adjust your positions</p>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
