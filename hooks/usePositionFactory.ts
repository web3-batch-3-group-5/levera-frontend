'use client';

import { useCallback, useState, useEffect } from 'react';
import { useReadContract, useReadContracts, useWriteContract, useAccount, useChainId } from 'wagmi';
import { Address } from 'viem';
import { CONTRACTS } from '@/config/contracts';
import { toast } from 'sonner';

// Types
interface PositionData {
  id: string;
  address: Address;
  lendingPoolAddress?: Address;
  pool?: {
    address?: Address;
    loanToken?: {
      symbol?: string;
      decimals?: number;
    };
    collateralToken?: {
      symbol?: string;
      decimals?: number;
    };
  };
  lendingPool?: {
    address?: Address;
    loanToken?: {
      symbol?: string;
      decimals?: number;
    };
    collateralToken?: {
      symbol?: string;
      decimals?: number;
    };
  };
}

export function usePositionFactory() {
  const chainId = useChainId();
  const { address: userAddress, isConnected } = useAccount();
  const [userPositions, setUserPositions] = useState<PositionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  console.log('[usePositionFactory] User Address:', userAddress, ', isConnected:', isConnected);

  // Read positions from the contract for all pools
  // Note: Since we don't have a function to get all positions across all pools,
  // we'll just use a placeholder address for now - in a real app you'd need to
  // iterate through all known pools or use a subgraph
  const {
    data: positionAddresses,
    isLoading: isLoadingAddresses,
    refetch: refetchPositionAddresses,
  } = useReadContract({
    address: CONTRACTS.POSITION_FACTORY.address,
    abi: CONTRACTS.POSITION_FACTORY.abi,
    functionName: 'getPoolPositions',
    args: [
      userAddress || ('0x0000000000000000000000000000000000000000' as Address),
      '0x0000000000000000000000000000000000000000' as Address,
    ],
    query: {
      enabled: !!userAddress && isConnected,
    },
  });

  // Get pool addresses to query all user positions
  const { data: poolAddresses } = useReadContracts({
    contracts: Array.from({ length: 20 }, (_, i) => ({
      address: CONTRACTS.LENDING_POOL_FACTORY.address,
      abi: CONTRACTS.LENDING_POOL_FACTORY.abi,
      functionName: 'createdLendingPools',
      args: [BigInt(i)],
    })),
  });

  // Get positions for all pools
  useEffect(() => {
    const getAllPositions = async () => {
      if (!userAddress || !isConnected || !poolAddresses) {
        setUserPositions([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Filter valid pool addresses (non-zero)
        const validPools = poolAddresses
          .filter(result => result.status === 'success')
          .map(result => result.result as Address)
          .filter(addr => !!addr && addr !== '0x0000000000000000000000000000000000000000');

        // Get positions for each pool
        const allPositionsPromises = validPools.map(poolAddress =>
          fetchPoolPositions(poolAddress, userAddress as Address),
        );

        // Combine all positions
        const allPositionsResults = await Promise.allSettled(allPositionsPromises);

        let allPositions: PositionData[] = [];

        allPositionsResults.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value.length > 0) {
            // Add pool address to each position
            const positionsWithPool = result.value.map(pos => ({
              ...pos,
              lendingPoolAddress: validPools[index],
              // Add this structure for compatibility with MarginCard
              lendingPool: {
                address: validPools[index],
              },
            }));
            allPositions = [...allPositions, ...positionsWithPool];
          } else if (result.status === 'rejected') {
            console.error(`Error fetching positions for pool ${validPools[index]}:`, result.reason);
          }
        });

        if (allPositions.length > 0) {
          // Fetch additional position data if needed
          const positionsWithData = await fetchPositionsData(allPositions);
          setUserPositions(positionsWithData);
        } else {
          setUserPositions([]);
        }
      } catch (err) {
        console.error('[getAllPositions] Error fetching positions:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch positions'));
      } finally {
        setIsLoading(false);
      }
    };

    getAllPositions();
  }, [userAddress, isConnected, poolAddresses]);

  // Helper function to fetch positions for a single pool
  const fetchPoolPositions = async (poolAddress: Address, userAddress: Address): Promise<PositionData[]> => {
    try {
      const result = await fetch(
        `/api/positions?chainId=${chainId}&poolAddress=${poolAddress}&userAddress=${userAddress}`,
      );

      // This is a mock response - in a real app you would use your backend/subgraph
      // or directly query the contract
      if (!result.ok) {
        // For demo purposes, simulate position data
        return Array.from({ length: Math.floor(Math.random() * 3) }, (_, i) => ({
          id: `${poolAddress}-${i}`,
          address: `0x${i}${'0'.repeat(39)}` as Address,
        }));
      }

      return await result.json();
    } catch (err) {
      console.error(`[fetchPoolPositions] Error fetching positions for pool ${poolAddress}:`, err);
      return [];
    }
  };

  // Helper function to fetch additional data for positions
  const fetchPositionsData = async (positions: PositionData[]): Promise<PositionData[]> => {
    // In a real app, you would batch fetch position data from contracts
    // For now, we'll just return the positions as they are
    return positions;
  };

  const { writeContract, isPending: isCreatingPosition } = useWriteContract();

  // Refresh function to manually trigger data refetch
  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);

      // Refetch positions
      await refetchPositionAddresses();
      return true;
    } catch (err) {
      console.error('[refresh] Error refreshing positions:', err);
      setError(err instanceof Error ? err : new Error('Failed to refresh positions'));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [refetchPositionAddresses]);

  // Create a new position
  const createPosition = useCallback(
    async (lendingPoolAddress: Address, baseCollateral: bigint, leverage: number) => {
      if (!userAddress) throw new Error('Wallet not connected');

      try {
        // Convert leverage to contract format (e.g., 1.5 -> 150)
        const leverageBps = BigInt(Math.floor(leverage * 100));

        toast.loading('Creating position...', { id: 'create-position' });

        const hash = await writeContract({
          address: CONTRACTS.POSITION_FACTORY.address,
          abi: CONTRACTS.POSITION_FACTORY.abi,
          functionName: 'createPosition',
          args: [lendingPoolAddress, baseCollateral, leverageBps],
        });

        console.log('[createPosition] Transaction hash:', hash);

        toast.dismiss('create-position');
        toast.success('Position created! Updating data...');

        // Refresh positions after creation
        setTimeout(() => {
          refresh();
        }, 2000); // Wait for transaction to be indexed

        return hash;
      } catch (err) {
        console.error('[createPosition] Error creating position:', err);
        toast.dismiss('create-position');

        if (err instanceof Error) {
          if (err.message.includes('rejected')) {
            toast.error('Transaction rejected');
          } else {
            toast.error(`Failed to create position: ${err.message}`);
          }
        } else {
          toast.error('Failed to create position');
        }

        throw err;
      }
    },
    [writeContract, userAddress, refresh],
  );

  // Delete a position
  const deletePosition = useCallback(
    async (lendingPoolAddress: Address, onBehalf: Address = userAddress as Address) => {
      if (!userAddress) throw new Error('Wallet not connected');

      try {
        toast.loading('Closing position...', { id: 'close-position' });

        const hash = await writeContract({
          address: CONTRACTS.POSITION_FACTORY.address,
          abi: CONTRACTS.POSITION_FACTORY.abi,
          functionName: 'deletePosition',
          args: [lendingPoolAddress, onBehalf],
        });

        console.log('[deletePosition] Transaction hash:', hash);

        toast.dismiss('close-position');
        toast.success('Position closed successfully!');

        // Refresh positions after deletion
        setTimeout(() => {
          refresh();
        }, 2000); // Wait for transaction to be indexed

        return hash;
      } catch (err) {
        console.error('[deletePosition] Error deleting position:', err);
        toast.dismiss('close-position');

        if (err instanceof Error) {
          if (err.message.includes('rejected')) {
            toast.error('Transaction rejected');
          } else {
            toast.error(`Failed to close position: ${err.message}`);
          }
        } else {
          toast.error('Failed to close position');
        }

        throw err;
      }
    },
    [writeContract, userAddress, refresh],
  );

  // Get a position by address
  const getPositionByAddress = useCallback(
    (positionAddress: Address) => {
      const position = userPositions.find(position => position.address.toLowerCase() === positionAddress.toLowerCase());
      return position;
    },
    [userPositions],
  );

  // Get positions for a specific lending pool
  const getPositionsByLendingPool = useCallback(
    (lendingPoolAddress: Address) => {
      const positions = userPositions.filter(position => {
        const poolAddress = position.lendingPoolAddress || position.pool?.address || position.lendingPool?.address;
        return poolAddress?.toLowerCase() === lendingPoolAddress.toLowerCase();
      });
      return positions;
    },
    [userPositions],
  );

  return {
    userPositions,
    isLoading,
    error,
    createPosition,
    deletePosition,
    getPositionByAddress,
    getPositionsByLendingPool,
    refresh,
    isCreatingPosition,
  };
}
