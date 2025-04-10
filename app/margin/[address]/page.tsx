'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Address } from 'viem';
import { Button } from '@/components/shared/Button';
import {
  ArrowLeft,
  Info,
  AlertTriangle,
  Plus,
  Scale,
  Activity,
  TrendingUp,
} from 'lucide-react';
import { useLendingPool } from '@/hooks/useLendingPool';
import { useLendingPoolFactory } from '@/hooks/useLendingPoolFactory';
import { formatTokenAmount } from '@/lib/utils/format';
import { formatAddress } from '@/lib/utils';
import { useAccount } from 'wagmi';
import { PositionDashboard } from '@/components/margin/PositionDashboard';

// Helper function to format percentage
const formatPercentage = (value: number) => {
  return (
    value.toLocaleString(undefined, {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }) + '%'
  );
};

export default function MarginDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const poolAddress = params.address as Address;
  const { isConnected } = useAccount();

  // Client-side detection
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    console.log('Component mounted, setting isClient to true');
  }, []);

  // Get pool details
  const { poolAddresses, pools } = useLendingPoolFactory();
  const poolIndex = poolAddresses.findIndex(
    (addr) => addr.toLowerCase() === poolAddress.toLowerCase()
  );
  const pool = poolIndex !== -1 ? pools[poolIndex] : undefined;

  // Get pool data
  const {
    totalSupplyAssets,
    totalBorrowAssets,
    interestRate,
    isLoading: isLoadingPool,
    error: poolError,
  } = useLendingPool(poolAddress);

  // Calculate utilization rate
  const utilizationRate =
    totalSupplyAssets && totalSupplyAssets > 0n
      ? (Number(totalBorrowAssets || 0n) / Number(totalSupplyAssets)) * 100
      : 0;

  const handleOpenPosition = () => {
    router.push(`/margin/${poolAddress}/trade`);
  };

  // Loading state
  const isLoading = isLoadingPool;
  const error = poolError;

  if (!isLoading && !pool) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <Button
          variant='ghost'
          onClick={() => router.push('/margin')}
          className='gap-2 mb-8'
        >
          <ArrowLeft className='size-4' />
          Back To Margin Trading
        </Button>

        <div className='text-center py-12 border rounded-lg bg-card'>
          <AlertTriangle className='size-12 text-destructive mx-auto mb-4' />
          <h2 className='text-xl font-bold mb-2'>Pool Not Found</h2>
          <p className='text-muted-foreground mb-6'>
            The margin trading pool you&apos;re looking for doesn&apos;t exist
            or has been removed.
          </p>
          <Button onClick={() => router.push('/margin')}>
            Return to Margin Trading
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className='container mx-auto px-4 py-8'>
      <div className='flex justify-between items-center mb-6'>
        <Button
          variant='ghost'
          onClick={() => router.push('/margin')}
          className='gap-2'
        >
          <ArrowLeft className='size-4' />
          Back To Margin Trading
        </Button>
      </div>

      <div className='space-y-8'>
        {/* Error State */}
        {error && (
          <div className='bg-destructive/10 border border-destructive rounded-lg p-4 flex items-center gap-3'>
            <AlertTriangle className='size-5 text-destructive flex-shrink-0' />
            <div>
              <h3 className='font-medium text-destructive'>
                Error loading data
              </h3>
              <p className='text-sm text-muted-foreground'>
                {error.message ||
                  'An error occurred while loading the pool data. Please try again later.'}
              </p>
            </div>
          </div>
        )}

        {/* Title Section */}
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
          <div>
            <h1 className='text-3xl font-bold'>
              {isLoading ? (
                <div className='h-9 bg-muted rounded w-48 animate-pulse'></div>
              ) : (
                <>
                  {pool?.loanTokenSymbol}/{pool?.collateralTokenSymbol} Trading
                  Pool
                </>
              )}
            </h1>
            <p className='text-sm text-muted-foreground mt-1'>
              Pool Address: {formatAddress(poolAddress)}
            </p>
          </div>
          <div>
            {isClient && isConnected && (
              <Button onClick={handleOpenPosition} className='gap-2'>
                <Plus className='size-4' />
                Open Position
              </Button>
            )}
          </div>
        </div>

        {/* Pool Stats */}
        {isLoading ? (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className='bg-card rounded-lg border p-6 animate-pulse'
              >
                <div className='flex items-center gap-2 mb-2'>
                  <div className='w-4 h-4 bg-muted rounded'></div>
                  <div className='h-4 w-24 bg-muted rounded'></div>
                </div>
                <div className='h-8 bg-muted rounded w-24 mb-1'></div>
                <div className='h-4 bg-muted rounded w-48'></div>
              </div>
            ))}
          </div>
        ) : (
          pool && (
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='bg-card rounded-lg border p-6'>
                <div className='flex items-center gap-2 mb-2'>
                  <TrendingUp className='size-4 text-primary' />
                  <h3 className='text-sm font-medium'>Position Type</h3>
                </div>
                <p className='text-2xl font-bold'>
                  {pool.positionType === 0 ? 'LONG' : 'SHORT'}
                </p>
                <p className='text-sm text-muted-foreground mt-1'>
                  {pool.positionType === 0
                    ? `${pool.collateralTokenSymbol} → ${pool.loanTokenSymbol}`
                    : `${pool.loanTokenSymbol} → ${pool.collateralTokenSymbol}`}
                </p>
              </div>

              <div className='bg-card rounded-lg border p-6'>
                <div className='flex items-center gap-2 mb-2'>
                  <Scale className='size-4 text-primary' />
                  <h3 className='text-sm font-medium'>Liquidation Threshold</h3>
                </div>
                <p className='text-2xl font-bold'>
                  {pool.liquidationThresholdPercentage
                    ? Number(pool.liquidationThresholdPercentage).toFixed(0)
                    : '0'}
                  %
                </p>
                <p className='text-sm text-muted-foreground mt-1'>
                  Health factor below 1.0 triggers liquidation
                </p>
              </div>

              <div className='bg-card rounded-lg border p-6'>
                <div className='flex items-center gap-2 mb-2'>
                  <Activity className='size-4 text-primary' />
                  <h3 className='text-sm font-medium'>Interest Rate</h3>
                </div>
                <p className='text-2xl font-bold'>
                  {formatPercentage(Number(interestRate || 0n))}
                </p>
                <p className='text-sm text-muted-foreground mt-1'>
                  Annual interest rate for borrows
                </p>
              </div>
            </div>
          )
        )}

        {/* My Positions Section */}
        <div className='bg-card rounded-lg border'>
          <div className='p-6 flex justify-between items-center border-b'>
            <h2 className='text-xl font-semibold'>My Positions</h2>
            {isClient && isConnected && (
              <Button onClick={handleOpenPosition} className='gap-2'>
                <Plus className='size-4' />
                Open Position
              </Button>
            )}
          </div>

          <div className='p-6'>
            {/* Use the improved PositionDashboard component */}
            <PositionDashboard
              poolAddress={poolAddress}
              onCreatePosition={handleOpenPosition}
            />
          </div>
        </div>

        {/* Pool Information Card */}
        {isLoading ? (
          <div className='bg-card rounded-lg border p-6 animate-pulse'>
            <div className='h-6 bg-muted rounded w-40 mb-4'></div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className='space-y-2'>
                  <div className='h-4 bg-muted rounded w-24'></div>
                  <div className='h-5 bg-muted rounded w-32'></div>
                </div>
              ))}
            </div>
            <div className='mt-6 bg-muted/50 p-4 rounded-lg border'>
              <div className='flex items-start gap-2'>
                <div className='h-4 w-4 bg-muted rounded mt-0.5'></div>
                <div className='space-y-2 w-full'>
                  <div className='h-4 bg-muted rounded w-32'></div>
                  <div className='h-16 bg-muted rounded w-full'></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          pool && (
            <div className='bg-card rounded-lg border p-6'>
              <h3 className='text-lg font-semibold mb-4'>Pool Information</h3>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                <div>
                  <p className='text-sm text-muted-foreground'>Loan Token</p>
                  <p className='font-medium'>
                    {pool.loanTokenSymbol} ({pool.loanTokenName})
                  </p>
                </div>

                <div>
                  <p className='text-sm text-muted-foreground'>
                    Collateral Token
                  </p>
                  <p className='font-medium'>
                    {pool.collateralTokenSymbol} ({pool.collateralTokenName})
                  </p>
                </div>

                <div>
                  <p className='text-sm text-muted-foreground'>
                    Utilization Rate
                  </p>
                  <p className='font-medium'>
                    {formatPercentage(utilizationRate)}
                  </p>
                </div>

                <div>
                  <p className='text-sm text-muted-foreground'>Total Supply</p>
                  <p className='font-medium'>
                    {formatTokenAmount(totalSupplyAssets, {
                      decimals: pool.loanTokenDecimals,
                    })}{' '}
                    {pool.loanTokenSymbol}
                  </p>
                </div>

                <div>
                  <p className='text-sm text-muted-foreground'>
                    Total Borrowed
                  </p>
                  <p className='font-medium'>
                    {formatTokenAmount(totalBorrowAssets, {
                      decimals: pool.loanTokenDecimals,
                    })}{' '}
                    {pool.loanTokenSymbol}
                  </p>
                </div>

                <div>
                  <p className='text-sm text-muted-foreground'>Created By</p>
                  <p className='font-medium font-mono text-sm'>
                    {formatAddress(pool.creator)}
                  </p>
                </div>
              </div>

              {/* Info box */}
              <div className='mt-6 bg-muted/50 p-4 rounded-lg border'>
                <div className='flex items-start gap-2'>
                  <Info className='size-4 text-primary mt-0.5 flex-shrink-0' />
                  <div>
                    <h4 className='text-sm font-medium'>Pool Health</h4>
                    <p className='text-sm text-muted-foreground'>
                      This pool has a{' '}
                      {formatPercentage(Number(interestRate || 0n))} interest
                      rate and a{' '}
                      {pool.liquidationThresholdPercentage
                        ? Number(pool.liquidationThresholdPercentage).toFixed(0)
                        : '0'}
                      % liquidation threshold. Positions are{' '}
                      {pool.positionType === 0 ? 'LONG' : 'SHORT'}, meaning
                      you&apos;ll profit when
                      {pool.positionType === 0
                        ? ` the price of ${pool.collateralTokenSymbol} increases relative to ${pool.loanTokenSymbol}.`
                        : ` the price of ${pool.collateralTokenSymbol} decreases relative to ${pool.loanTokenSymbol}.`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        )}

        {/* Leverage Explanation Card */}
        <div className='bg-card rounded-lg border p-6'>
          <h3 className='text-lg font-semibold mb-4'>Understanding Leverage</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <h4 className='text-base font-medium mb-2'>How Leverage Works</h4>
              <p className='text-sm text-muted-foreground mb-2'>
                Leverage allows you to multiply your exposure to price movements
                by borrowing assets from the lending pool. For example, with 2x
                leverage:
              </p>
              <ul className='list-disc list-inside text-sm text-muted-foreground space-y-1 pl-2'>
                <li>
                  If the market moves 10% in your favor, your returns are ~20%
                </li>
                <li>
                  If the market moves 10% against you, your losses are ~20%
                </li>
              </ul>
            </div>
            <div>
              <h4 className='text-base font-medium mb-2'>Liquidation Risk</h4>
              <p className='text-sm text-muted-foreground mb-2'>
                Higher leverage means higher risk of liquidation. Your position
                will be liquidated if:
              </p>
              <ul className='list-disc list-inside text-sm text-muted-foreground space-y-1 pl-2'>
                <li>Your health factor drops below 1.0</li>
                <li>The market price reaches your liquidation price</li>
                <li>
                  Always monitor your positions and add collateral if needed
                </li>
              </ul>
            </div>
          </div>

          <div className='mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg'>
            <div className='flex items-start gap-2'>
              <Info className='size-4 text-blue-500 mt-0.5 flex-shrink-0' />
              <p className='text-sm text-blue-700 dark:text-blue-300'>
                For this pool, the maximum leverage is 3x. Higher leverage means
                higher returns but also higher risk. Start with lower leverage
                if you&apos;re new to margin trading.
              </p>
            </div>
          </div>

          <div className='flex justify-center mt-6'>
            <Button onClick={handleOpenPosition} className='gap-2'>
              <TrendingUp className='size-4' />
              Start Trading Now
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
