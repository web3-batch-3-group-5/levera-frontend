// graphql/hooks/usePositions.ts

import { useQuery } from '@tanstack/react-query';
import { queryGraph, CACHE_TIME } from '@/graphql/client';
import { GET_USER_POSITIONS, GET_POSITION } from '@/graphql/queries/positions';
import type { PositionsResponse, PositionResponse } from '@/graphql/types';

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