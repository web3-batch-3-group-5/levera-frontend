// graphql/hooks/usePositions.ts

import { useQuery } from '@tanstack/react-query';
import { queryGraph, CACHE_TIME } from '@/graphql/client';
import { GET_POOL_POSITIONS, GET_USER_POSITIONS, GET_POSITION } from '@/graphql/queries/positions';
import type { Position, PositionsResponse, PositionResponse } from '@/graphql/types';

export function usePoolPositions(
    poolAddress: string,
    {
        first = 10,
        skip = 0,
        orderBy = 'createdAt',
        orderDirection = 'desc'
    } = {}
) {
    return useQuery({
        queryKey: ['pool-positions', poolAddress, first, skip, orderBy, orderDirection],
        queryFn: () => queryGraph<PositionsResponse>(GET_POOL_POSITIONS, {
            poolAddress,
            first,
            skip,
            orderBy,
            orderDirection,
        }),
        staleTime: CACHE_TIME.STANDARD,
        enabled: Boolean(poolAddress),
    });
}

export function useUserPositions(
    userAddress: string,
    { first = 10, skip = 0 } = {}
) {
    return useQuery({
        queryKey: ['user-positions', userAddress, first, skip],
        queryFn: () => queryGraph<PositionsResponse>(GET_USER_POSITIONS, {
            userAddress,
            first,
            skip,
        }),
        staleTime: CACHE_TIME.STANDARD,
        enabled: Boolean(userAddress),
    });
}

export function usePosition(positionId: string) {
    return useQuery({
        queryKey: ['position', positionId],
        queryFn: () => queryGraph<PositionResponse>(GET_POSITION, {
            positionId,
        }),
        staleTime: CACHE_TIME.STANDARD,
        enabled: Boolean(positionId),
    });
}