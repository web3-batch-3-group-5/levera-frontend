'use client';

import { useReadContracts } from 'wagmi';
import { Address, erc20Abi } from 'viem';
import { CONTRACTS } from '@/config/contracts';
import { useQueryClient } from '@tanstack/react-query';

type TokenMetadata = {
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
};

export function useTokenMetadata() {
  const queryClient = useQueryClient();

  // Flatten all contract calls into a single array
  const { data, isLoading, isError, error } = useReadContracts({
    contracts: CONTRACTS.TOKEN_ADDRESSES.flatMap(address => [
      {
        address,
        abi: erc20Abi,
        functionName: 'name',
      },
      {
        address,
        abi: erc20Abi,
        functionName: 'symbol',
      },
      {
        address,
        abi: erc20Abi,
        functionName: 'decimals',
      },
    ]),
    query: {
      staleTime: 3600_000, // 1 hour
      gcTime: 24 * 3600_000, // 1 day
      // Memoized data transformation
      select: rawData => {
        return CONTRACTS.TOKEN_ADDRESSES.reduce(
          (acc, address, index) => {
            const startIdx = index * 3;
            const [nameResult, symbolResult, decimalsResult] = rawData.slice(startIdx, startIdx + 3);
            const symbol = symbolResult?.status === 'success' ? (symbolResult.result as string) : 'UNKNOWN';

            acc[symbol] = {
              name: nameResult?.status === 'success' ? (nameResult.result as string) : 'Unknown Token',
              symbol,
              address,
              decimals: decimalsResult?.status === 'success' ? (decimalsResult.result as number) : 18,
            };
            return acc;
          },
          {} as Record<string, TokenMetadata>,
        );
      },
    },
  });

  // Cache management utilities
  const refreshCache = () => {
    queryClient.invalidateQueries({
      queryKey: ['readContracts', CONTRACTS.TOKEN_ADDRESSES],
    });
  };

  const getCacheState = () => ({
    updatedAt: queryClient.getQueryState(['readContracts', CONTRACTS.TOKEN_ADDRESSES])?.dataUpdatedAt,
    isStale:
      queryClient.isFetching({
        queryKey: ['readContracts', CONTRACTS.TOKEN_ADDRESSES],
      }) !== undefined,
  });

  return {
    data: data ?? {},
    isLoading,
    isError,
    error,
    refreshCache,
    getCacheState,
  };
}
