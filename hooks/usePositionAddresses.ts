'use client';

import { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';
import { Address, isAddress } from 'viem';
import { positionFactoryABI } from '@/lib/abis/positionFactory';
import { CONTRACTS } from '@/config/contracts';

/**
 * Hook to fetch position addresses for a specific user and pool
 * @param userAddress The address of the user
 * @param poolAddress The address of the lending pool
 */
export function usePositionAddresses(userAddress: Address | undefined, poolAddress: Address) {
  const [positionAddresses, setPositionAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Clear error state when inputs change
  useEffect(() => {
    setError(null);
  }, [userAddress, poolAddress]);

  // Validate inputs
  const isValidPoolAddress = poolAddress && isAddress(poolAddress);
  const isValidUserAddress = userAddress && isAddress(userAddress);
  const shouldFetch = isValidPoolAddress && isValidUserAddress;

  // Get all positions for the user and pool from the position factory
  const {
    data: positions,
    isLoading: isLoadingPositions,
    error: positionsError,
    refetch,
  } = useReadContract({
    address: CONTRACTS.POSITION_FACTORY.address,
    abi: positionFactoryABI,
    functionName: 'getPoolPositions',
    args: [userAddress || ('0x0000000000000000000000000000000000000000' as Address), poolAddress],
    query: {
      enabled: shouldFetch,
    },
  });

  // Process position addresses
  useEffect(() => {
    if (!shouldFetch) {
      setPositionAddresses([]);
      setIsLoading(false);
      return;
    }

    if (isLoadingPositions) {
      setIsLoading(true);
      return;
    }

    if (positionsError) {
      console.error('Error fetching position addresses:', positionsError);
      setError(positionsError instanceof Error ? positionsError : new Error('Failed to fetch positions'));
      setIsLoading(false);
      return;
    }

    try {
      console.log('Raw Positions Data:', positions);

      if (!positions) {
        setPositionAddresses([]);
        setIsLoading(false);
        return;
      }

      // Filter out zero addresses
      const validAddresses = (positions as Address[]).filter(
        addr => addr !== '0x0000000000000000000000000000000000000000',
      );

      console.log('Filtered Position Addresses:', validAddresses);
      setPositionAddresses(validAddresses);
      setError(null);
    } catch (err) {
      console.error('Error processing position addresses:', err);
      setError(err instanceof Error ? err : new Error('Failed to process position addresses'));
    } finally {
      setIsLoading(false);
    }
  }, [positions, isLoadingPositions, positionsError, shouldFetch, userAddress, poolAddress]);

  // Enhanced refetch function with error clearing
  const refreshPositions = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await refetch();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh positions'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    positionAddresses,
    isLoading,
    error,
    refetch: refreshPositions,
  };
}
