'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Address } from 'viem';
import { Button } from '@/components/shared/Button';
import { ArrowLeft, AlertTriangle, ExternalLink } from 'lucide-react';
import { usePosition } from '@/hooks/usePosition';
import { useLendingPool } from '@/hooks/useLendingPool';
import { useLendingPoolFactory } from '@/hooks/useLendingPoolFactory';
import { formatTokenAmount } from '@/lib/utils/format';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { toast } from 'sonner';
import { LiquidationCalculator } from '@/lib/health';
import { formatAddress } from '@/lib/utils';
import { positionABI } from '@/lib/abis/position';

export default function AdjustLeveragePage() {
  const router = useRouter();
  const params = useParams();
  const poolAddress = params.address as Address;
  const positionAddress = params.positionAddress as Address;

  // State management
  const [newLeverage, setNewLeverage] = useState(150); // Basis points: 1.5x
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);

  // Get pool data
  const { poolAddresses, pools } = useLendingPoolFactory();
  const poolIndex = poolAddresses.findIndex(addr => addr.toLowerCase() === poolAddress.toLowerCase());
  const pool = poolIndex !== -1 ? pools[poolIndex] : undefined;

  // Get position data
  const {
    baseCollateral,
    effectiveCollateral,
    borrowShares,
    leverage,
    liquidationPrice,
    health,
    isLoading: isLoadingPosition,
    error: positionError,
  } = usePosition(positionAddress);

  // Get lending pool data
  const { ltp } = useLendingPool(poolAddress);

  // Contract functions
  const { writeContract, isPending: isWritePending } = useWriteContract();

  // Transaction confirmation
  const { isLoading: isConfirming, data: receipt } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Initialize with current leverage
  useEffect(() => {
    if (leverage) {
      setNewLeverage(Number(leverage));
    }
  }, [leverage]);

  // Watch for transaction completion
  useEffect(() => {
    if (receipt?.status === 'success') {
      toast.dismiss('tx-confirm');
      toast.success('Leverage updated successfully!');
      router.push(`/margin/${poolAddress}/${positionAddress}`);
    }
  }, [receipt, router, poolAddress, positionAddress]);

  // Calculate how this affects health factor and liquidation price
  const calculateUpdatedMetrics = () => {
    if (!newLeverage || !health || !ltp || !baseCollateral || !effectiveCollateral || !borrowShares) {
      return {
        newHealth: Number(health) / 100 || 0,
        newLiquidationPrice: Number(liquidationPrice) || 0,
        healthChange: 0,
        liquidationPriceChange: 0,
      };
    }

    try {
      // Current values
      const currentBaseCollateral = Number(baseCollateral);
      const currentBorrowAmount = Number(borrowShares);

      // New values
      const newLeverageDecimal = newLeverage / 100;
      const newEffectiveCollateral = currentBaseCollateral * newLeverageDecimal;

      // Calculate updated metrics
      const calculator = new LiquidationCalculator(ltp);
      const newHealth = calculator.getHealth(newEffectiveCollateral, currentBorrowAmount);
      const newLiquidationPrice = calculator.getLiquidationPrice(newEffectiveCollateral, currentBorrowAmount);

      const currentHealth = Number(health) / 100;
      const currentLiquidationPrice = Number(liquidationPrice);

      return {
        newHealth,
        newLiquidationPrice,
        healthChange: newHealth - currentHealth,
        liquidationPriceChange: newLiquidationPrice - currentLiquidationPrice,
      };
    } catch (error) {
      console.error('Error calculating updated metrics:', error);
      return {
        newHealth: Number(health) / 100 || 0,
        newLiquidationPrice: Number(liquidationPrice) || 0,
        healthChange: 0,
        liquidationPriceChange: 0,
      };
    }
  };

  const updatedMetrics = calculateUpdatedMetrics();

  // Determine if new leverage is higher or lower risk
  const isHigherRisk = updatedMetrics.healthChange < 0;

  // Update leverage
  const handleUpdateLeverage = async () => {
    if (!newLeverage) return;

    try {
      toast.loading('Updating leverage...', { id: 'update-leverage' });

      writeContract(
        {
          address: positionAddress,
          abi: positionABI,
          functionName: 'updateLeverage',
          args: [BigInt(newLeverage)],
        },
        {
          onSuccess: hash => {
            console.log('Update leverage transaction hash:', hash);
            setTxHash(hash);
            toast.dismiss('update-leverage');
            toast.loading('Transaction submitted, waiting for confirmation...', { id: 'tx-confirm' });
          },
          onError: error => {
            console.error('Update leverage error:', error);
            toast.dismiss('update-leverage');
            toast.error('Failed to update leverage: ' + error.message);
          },
        },
      );
    } catch (error) {
      console.error('Error updating leverage:', error);
      toast.dismiss('update-leverage');
      toast.error('Failed to update leverage');
    }
  };

  // Action button state
  const isDisabled = isWritePending || isConfirming || Number(newLeverage) === Number(leverage);
  const buttonLabel = isWritePending || isConfirming ? 'Updating Leverage...' : 'Update Leverage';

  if (!pool || (isLoadingPosition && !positionError)) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <Button variant='ghost' className='mb-6' onClick={() => router.back()}>
          <ArrowLeft className='size-4 mr-2' />
          Back
        </Button>

        <div className='max-w-xl mx-auto'>
          <div className='bg-card rounded-lg border p-6'>
            <div className='text-center py-8'>
              <div className='size-8 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4'></div>
              <p className='text-muted-foreground'>Loading position data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (positionError) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <Button variant='ghost' className='mb-6' onClick={() => router.back()}>
          <ArrowLeft className='size-4 mr-2' />
          Back
        </Button>

        <div className='max-w-xl mx-auto'>
          <div className='bg-card rounded-lg border p-6'>
            <div className='text-center py-8'>
              <AlertTriangle className='size-10 text-destructive mx-auto mb-4' />
              <h3 className='text-xl font-bold mb-2'>Error Loading Position</h3>
              <p className='text-muted-foreground mb-6'>{positionError || 'Failed to load position data'}</p>
              <Button onClick={() => router.back()}>Go Back</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className='container mx-auto px-4 py-8'>
      <Button variant='ghost' className='mb-6' onClick={() => router.back()}>
        <ArrowLeft className='size-4 mr-2' />
        Back to Position
      </Button>

      <div className='max-w-xl mx-auto'>
        <div className='bg-card rounded-lg border p-6 space-y-6'>
          <div>
            <h1 className='text-xl font-bold mb-2'>Adjust Leverage</h1>
            <p className='text-sm text-muted-foreground'>
              Adjust leverage for your {pool.loanTokenSymbol}/{pool.collateralTokenSymbol} position
            </p>
          </div>

          {/* Current Position Summary */}
          <div className='bg-muted/50 rounded-lg p-4 space-y-3'>
            <div className='flex justify-between'>
              <span className='text-sm text-muted-foreground'>Position</span>
              <span className='font-mono text-sm'>{formatAddress(positionAddress)}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-muted-foreground'>Current Leverage</span>
              <span>{(Number(leverage) / 100).toFixed(2)}x</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-muted-foreground'>Current Health Factor</span>
              <span
                className={`${Number(health) / 100 < 1.1 ? 'text-red-500' : Number(health) / 100 < 1.3 ? 'text-yellow-500' : 'text-green-500'}`}
              >
                {(Number(health) / 100).toFixed(2)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-muted-foreground'>Current Liquidation Price</span>
              <span>${formatTokenAmount(liquidationPrice || 0n, { decimals: 6 })}</span>
            </div>
          </div>

          {/* Leverage Slider */}
          <div className='space-y-4'>
            <div className='flex justify-between'>
              <h2 className='text-lg font-medium'>New Leverage</h2>
              <div className='text-lg font-bold'>{(newLeverage / 100).toFixed(2)}x</div>
            </div>

            <div className='space-y-2'>
              <input
                type='range'
                min='100'
                max='300'
                step='5'
                value={newLeverage}
                onChange={e => setNewLeverage(parseInt(e.target.value))}
                className='w-full'
                disabled={isWritePending || isConfirming}
              />
              <div className='flex justify-between text-xs text-muted-foreground'>
                <span>1.00x</span>
                <span>2.00x</span>
                <span>3.00x</span>
              </div>
            </div>
          </div>

          {/* Risk Warning for higher leverage */}
          {isHigherRisk && newLeverage > Number(leverage) && (
            <div className='bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start gap-3'>
              <AlertTriangle className='size-5 text-amber-500 flex-shrink-0 mt-0.5' />
              <div>
                <p className='font-medium text-amber-800 dark:text-amber-300'>Increased Risk</p>
                <p className='text-sm text-amber-700 dark:text-amber-400'>
                  Increasing your leverage will lower your health factor and increase the risk of liquidation.
                </p>
              </div>
            </div>
          )}

          {/* Updated Position Summary */}
          <div className='bg-muted/50 rounded-lg p-4 space-y-3'>
            <div className='flex justify-between'>
              <span className='text-sm text-muted-foreground'>New Health Factor</span>
              <span
                className={`${
                  updatedMetrics.newHealth < 1.1
                    ? 'text-red-500'
                    : updatedMetrics.newHealth < 1.3
                      ? 'text-yellow-500'
                      : 'text-green-500'
                }`}
              >
                {updatedMetrics.newHealth.toFixed(2)}
                <span className={`${updatedMetrics.healthChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {' '}
                  ({updatedMetrics.healthChange >= 0 ? '+' : ''}
                  {updatedMetrics.healthChange.toFixed(2)})
                </span>
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-muted-foreground'>New Liquidation Price</span>
              <span>
                ${updatedMetrics.newLiquidationPrice.toFixed(6)}
                <span className={`${updatedMetrics.liquidationPriceChange <= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {' '}
                  ({updatedMetrics.liquidationPriceChange <= 0 ? '' : '+'}$
                  {updatedMetrics.liquidationPriceChange.toFixed(6)})
                </span>
              </span>
            </div>
          </div>

          {/* Action Button */}
          <Button className='w-full' size='lg' onClick={handleUpdateLeverage} disabled={isDisabled}>
            {buttonLabel}
          </Button>

          {/* Transaction Hash (if submitted) */}
          {txHash && (
            <div className='flex items-center justify-between pt-2 text-sm text-muted-foreground'>
              <span>Transaction:</span>
              <a
                href={`https://sepolia.arbiscan.io/tx/${txHash}`}
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-1 text-primary hover:underline'
              >
                {formatAddress(txHash)}
                <ExternalLink className='size-3.5' />
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
