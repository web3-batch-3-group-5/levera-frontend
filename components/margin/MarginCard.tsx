import { useState, useEffect } from 'react';
import { Address, formatUnits } from 'viem';
import { useRouter } from 'next/navigation';
import { usePosition } from '@/hooks/usePosition';
import { Button } from '@/components/shared/Button';
import { formatAddress } from '@/lib/utils';
import {
  Activity,
  TrendingUp,
  AlertCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  Info,
  Scale,
} from 'lucide-react';
import { useTokenMetadata } from '@/hooks/useTokenMetadata';

interface MarginCardProps {
  positionAddress: Address;
  lendingPoolAddress: Address;
  loanTokenSymbol: string;
  collateralTokenSymbol: string;
}

export function MarginCard({
  positionAddress,
  lendingPoolAddress,
  loanTokenSymbol,
  collateralTokenSymbol,
}: MarginCardProps) {
  const router = useRouter();
  const { data: tokenMetadata } = useTokenMetadata();
  const [isExpanded, setIsExpanded] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Get position data with improved error handling
  const {
    baseCollateral,
    effectiveCollateral,
    borrowShares,
    leverage,
    liquidationPrice,
    health,
    ltv,
    isLoading,
    error: positionError,
    isValid: isValidPosition,
    refresh: refreshPosition,
  } = usePosition(positionAddress);

  // Set initialLoadComplete after first load
  useEffect(() => {
    if (!isLoading && !initialLoadComplete) {
      setInitialLoadComplete(true);
    }
  }, [isLoading, initialLoadComplete]);

  // Create formatted values for UI display
  const formattedValues = {
    baseCollateral: baseCollateral
      ? formatUnits(
          baseCollateral,
          tokenMetadata[collateralTokenSymbol || '']?.decimals
        )
      : '0',
    effectiveCollateral: effectiveCollateral
      ? formatUnits(
          effectiveCollateral,
          tokenMetadata[collateralTokenSymbol || '']?.decimals
        )
      : '0',
    borrowShares: borrowShares
      ? formatUnits(borrowShares, tokenMetadata[loanTokenSymbol]?.decimals)
      : '0',
    leverage: leverage ? Number(leverage) / 100 : 1, // Convert from basis points to decimal
    liquidationPrice: liquidationPrice
      ? formatUnits(liquidationPrice, tokenMetadata[loanTokenSymbol]?.decimals)
      : '0',
    health: health ? (Number(health) / 100).toFixed(2) : '0.00', // Assuming health is in basis points
    ltv: ltv ? Number(ltv) / 10000 : 0, // Assuming LTV is in basis points
  };

  // Retry loading position data if there was an error
  const handleRetryLoad = (e: React.MouseEvent) => {
    e.stopPropagation();
    refreshPosition();
  };

  // Calculate health status and colors based on health factor
  const getHealthInfo = () => {
    if (!health) return { color: 'text-gray-500', status: 'Unknown' };

    const healthValue = Number(health) / 100; // Convert from basis points

    if (healthValue < 1.1) {
      return { color: 'text-red-500', status: 'At Risk' };
    } else if (healthValue < 1.3) {
      return { color: 'text-yellow-500', status: 'Caution' };
    } else {
      return { color: 'text-green-500', status: 'Healthy' };
    }
  };

  // Get health info
  const { color: healthColor, status: healthStatus } = getHealthInfo();

  // Navigate to detailed view
  const handleClick = () => {
    router.push(`/margin/${lendingPoolAddress}/${positionAddress}`);
  };

  // Action handlers with correct path structure
  const handleAddCollateral = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(
      `/margin/${lendingPoolAddress}/${positionAddress}/add-collateral`
    );
  };

  const handleAdjustLeverage = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(
      `/margin/${lendingPoolAddress}/${positionAddress}/adjust-leverage`
    );
  };

  const handleClosePosition = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(
      `/margin/${lendingPoolAddress}/${positionAddress}/close-position`
    );
  };

  // Toggle expanded view
  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  // Health status badge component
  const StatusBadge = () => (
    <div
      className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${healthColor.replace(
        'text',
        'bg'
      )}-100 ${healthColor} dark:${healthColor.replace('text', 'bg')}-900/50`}
    >
      <span
        className={`size-1.5 rounded-full ${healthColor.replace('text', 'bg')}`}
      ></span>
      {healthStatus}
    </div>
  );

  // Error state rendering
  if (
    positionError ||
    (!isLoading && !isValidPosition && initialLoadComplete)
  ) {
    return (
      <div className='bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow'>
        <div className='p-6 space-y-4'>
          <div className='flex items-start justify-between'>
            <div>
              <h3 className='text-lg font-semibold'>
                {loanTokenSymbol}/{collateralTokenSymbol} Position
              </h3>
              <p className='text-sm text-muted-foreground'>
                Position ID: {formatAddress(positionAddress)}
              </p>
            </div>
          </div>

          <div className='flex items-center gap-2 text-destructive'>
            <AlertCircle className='size-4' />
            <span className='text-sm'>
              {positionError || 'Error loading position data'}
            </span>
          </div>

          <div className='flex gap-2'>
            <Button
              onClick={handleRetryLoad}
              className='flex-1'
              variant='outline'
              size='sm'
            >
              Retry Loading
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/margin/${lendingPoolAddress}/${positionAddress}`);
              }}
              className='flex-1'
              variant='default'
              size='sm'
            >
              View Details
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state rendering
  if (isLoading && !initialLoadComplete) {
    return (
      <div className='bg-card rounded-lg border shadow-sm animate-pulse'>
        <div className='p-6 space-y-4'>
          <div className='flex justify-between'>
            <div className='space-y-2'>
              <div className='h-5 bg-muted rounded w-48'></div>
              <div className='h-4 bg-muted rounded w-36'></div>
            </div>
            <div className='h-6 w-20 bg-muted rounded'></div>
          </div>
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
            {[...Array(4)].map((_, i) => (
              <div key={i} className='space-y-1'>
                <div className='h-4 bg-muted rounded w-24'></div>
                <div className='h-5 bg-muted rounded w-16'></div>
              </div>
            ))}
          </div>
          <div className='flex justify-end gap-2'>
            <div className='h-8 bg-muted rounded w-16'></div>
            <div className='h-8 bg-muted rounded w-16'></div>
          </div>
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
            {loanTokenSymbol}/{collateralTokenSymbol} Position
          </h3>
          <p className='text-sm text-muted-foreground'>
            Position ID: {formatAddress(positionAddress)}
          </p>
        </div>
        <StatusBadge />
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
        <div className='space-y-1'>
          <p className='text-sm text-muted-foreground flex items-center gap-1'>
            <Scale className='size-4' />
            Collateral
          </p>
          <p className='font-medium'>
            {formattedValues.baseCollateral} {collateralTokenSymbol}
          </p>
        </div>

        <div className='space-y-1'>
          <p className='text-sm text-muted-foreground flex items-center gap-1'>
            <Activity className='size-4' />
            Liquidation Price
          </p>
          <p className='font-medium'>${formattedValues.liquidationPrice}</p>
        </div>

        <div className='space-y-1'>
          <p className='text-sm text-muted-foreground flex items-center gap-1'>
            <AlertCircle className='size-4' />
            Health Factor
          </p>
          <p className={`font-medium ${healthColor}`}>
            {formattedValues.health}
          </p>
        </div>

        <div className='space-y-1'>
          <p className='text-sm text-muted-foreground flex items-center gap-1'>
            <TrendingUp className='size-4' />
            Leverage
          </p>
          <p className='font-medium'>{formattedValues.leverage}x</p>
        </div>
      </div>
    </>
  );

  // Expanded content (only shown when expanded)
  const expandedContent = isExpanded && (
    <div className='mt-4 pt-4 border-t'>
      <div className='grid grid-cols-2 gap-4 mb-4'>
        <div className='space-y-1'>
          <p className='text-sm text-muted-foreground'>Effective Collateral</p>
          <p className='font-medium'>
            {formattedValues.effectiveCollateral} {collateralTokenSymbol}
          </p>
        </div>

        <div className='space-y-1'>
          <p className='text-sm text-muted-foreground'>Borrowed Amount</p>
          <p className='font-medium'>
            {formattedValues.borrowShares} {loanTokenSymbol}
          </p>
        </div>

        <div className='space-y-1'>
          <p className='text-sm text-muted-foreground'>LTV (Loan to Value)</p>
          <p className='font-medium'>
            {(formattedValues.ltv * 100).toFixed(2)}%
          </p>
        </div>

        <div className='space-y-1'>
          <p className='text-sm text-muted-foreground'>Pool Address</p>
          <p className='font-medium font-mono text-xs'>
            {formatAddress(lendingPoolAddress)}
          </p>
        </div>
      </div>

      <div className='flex gap-2 mt-4'>
        <Button
          className='flex-1'
          variant='outline'
          size='sm'
          onClick={handleAddCollateral}
        >
          <ArrowDownCircle className='size-4 mr-1' />
          Add Collateral
        </Button>
        <Button
          className='flex-1'
          variant='outline'
          size='sm'
          onClick={handleAdjustLeverage}
        >
          <TrendingUp className='size-4 mr-1' />
          Adjust Leverage
        </Button>
        <Button
          className='flex-1'
          variant='secondary'
          size='sm'
          onClick={handleClosePosition}
        >
          <ArrowUpCircle className='size-4 mr-1' />
          Close
        </Button>
      </div>
    </div>
  );

  // Action buttons for collapsed state
  const collapsedButtons = !isExpanded && (
    <div className='flex gap-2'>
      <Button variant='outline' size='sm' onClick={handleAddCollateral}>
        <ArrowDownCircle className='size-3.5 mr-1' />
        Add
      </Button>
      <Button variant='secondary' size='sm' onClick={handleClosePosition}>
        <ArrowUpCircle className='size-3.5 mr-1' />
        Close
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
