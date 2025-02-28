'use client';

import { useState, useEffect } from 'react';
import { Address } from 'viem';
import { usePositionAddresses } from '@/hooks/usePositionAddresses';
import { useLendingPoolFactory } from '@/hooks/useLendingPoolFactory';
import { Button } from '@/components/shared/Button';
import { MarginCard } from '@/components/margin/MarginCard';
import { Plus, RefreshCw, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';

interface PositionDashboardProps {
  poolAddress?: Address;
  onCreatePosition?: () => void;
}

export function PositionDashboard({ poolAddress, onCreatePosition }: PositionDashboardProps) {
  const router = useRouter();
  const { address: userAddress, isConnected } = useAccount();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Client-side rendering detection
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch pools data for getting token symbols
  const { pools, poolAddresses } = useLendingPoolFactory();
  
  // Fetch user positions using our improved hook
  const { 
    positionAddresses, 
    isLoading, 
    error, 
    refetch: refreshPositions 
  } = usePositionAddresses(userAddress, poolAddress as Address);

  // Log debug information
  useEffect(() => {
    if (poolAddress && userAddress) {
      console.log('PositionDashboard - Args:', {
        poolAddress,
        userAddress,
        positionsFound: positionAddresses.length
      });
    }
  }, [poolAddress, userAddress, positionAddresses]);

  // Get pool details for a position
  const getPoolDetails = (lendingPoolAddress: Address) => {
    if (!lendingPoolAddress) return null;
    
    const poolIndex = poolAddresses.findIndex(addr => 
      addr.toLowerCase() === lendingPoolAddress.toLowerCase()
    );
    
    return poolIndex !== -1 ? pools[poolIndex] : null;
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshPositions();
    } catch (err) {
      console.error('Error refreshing positions:', err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Handle create position click
  const handleCreatePosition = () => {
    if (onCreatePosition) {
      onCreatePosition();
    } else if (poolAddress) {
      router.push(`/margin/${poolAddress}/trade`);
    } else {
      router.push('/margin');
    }
  };

  // View when no positions found
  const NoPositionsView = () => (
    <div className="text-center py-12 border rounded-lg bg-card">
      <div className="max-w-md mx-auto space-y-4">
        <h3 className="text-lg font-medium">No open positions</h3>
        <p className="text-muted-foreground">
          {!isClient || !isConnected
            ? "Connect your wallet to view your positions"
            : "You don't have any open positions yet. Start trading to create positions."}
        </p>
        {isClient && isConnected && (
          <Button
            onClick={handleCreatePosition}
            className="gap-2"
          >
            <Plus className="size-4" />
            Open a Position
          </Button>
        )}
      </div>
    </div>
  );

  // View when error occurs
  const ErrorView = () => (
    <div className="bg-destructive/10 border border-destructive rounded-lg p-4 flex items-center gap-3">
      <AlertTriangle className="size-5 text-destructive flex-shrink-0" />
      <div>
        <h3 className="font-medium text-destructive">Error loading positions</h3>
        <p className="text-sm text-muted-foreground">
          {error?.message || 'An error occurred while loading the positions. Please try refreshing.'}
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="ml-auto"
        onClick={handleRefresh}
      >
        Try Again
      </Button>
    </div>
  );

  // Loading skeleton for positions
  const LoadingSkeletons = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="border rounded-lg p-4 bg-card animate-pulse">
          <div className="h-6 w-1/3 bg-muted rounded mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <div className="h-4 w-16 bg-muted rounded"></div>
              <div className="h-5 w-20 bg-muted rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-16 bg-muted rounded"></div>
              <div className="h-5 w-20 bg-muted rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-16 bg-muted rounded"></div>
              <div className="h-5 w-20 bg-muted rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-16 bg-muted rounded"></div>
              <div className="h-5 w-20 bg-muted rounded"></div>
            </div>
          </div>
          <div className="h-9 w-full bg-muted rounded"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {poolAddress ? 'Pool Positions' : 'My Positions'}
        </h2>
        <Button
          variant="outline"
          className="gap-2"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`size-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Main Content */}
      {error ? (
        <ErrorView />
      ) : isLoading ? (
        <LoadingSkeletons />
      ) : positionAddresses.length === 0 ? (
        <NoPositionsView />
      ) : (
        <div className="space-y-4">
          {positionAddresses.map((positionAddress) => {
            // Find pool details for the position - in a real app this would come from the position itself
            const poolData = poolAddress ? getPoolDetails(poolAddress) : null;
            const loanTokenSymbol = poolData?.loanTokenSymbol || 'TOKEN';
            const collateralTokenSymbol = poolData?.collateralTokenSymbol || 'COLL';
            
            return (
              <MarginCard
                key={positionAddress}
                positionAddress={positionAddress}
                lendingPoolAddress={poolAddress || '0x0000000000000000000000000000000000000000' as Address}
                loanTokenSymbol={loanTokenSymbol}
                collateralTokenSymbol={collateralTokenSymbol}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}