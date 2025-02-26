import { useQuery } from '@tanstack/react-query';
import { queryGraph, CACHE_TIME } from '@/graphql/client';
import { GET_LENDING_POOLS, GET_LENDING_POOL } from '../queries/lendingPool';
import type { LendingPoolsResponse, LendingPoolResponse } from '@/graphql/types';

export function handleSubgraphError(error: any) {
    console.error('Subgraph error:', error);
}

export function useGetLendingPools({ first = 10, skip = 0 } = {}) {
    return useQuery({
        queryKey: ['lending-pools', first, skip],
        queryFn: () => queryGraph<LendingPoolsResponse>(GET_LENDING_POOLS, {
            first,
            skip,
        }),
        staleTime: CACHE_TIME.STANDARD,
    });
}

export function useGetLendingPool(poolId: string) {
    return useQuery({
        queryKey: ['lending-pool', poolId],
        queryFn: () => queryGraph<LendingPoolResponse>(GET_LENDING_POOL, {
            poolId
        }),
        staleTime: CACHE_TIME.STANDARD,
        enabled: Boolean(poolId),
    });
}