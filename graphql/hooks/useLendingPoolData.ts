import { useQuery } from 'urql';
import { GET_LENDING_POOL, GET_USER_POSITIONS, GET_POOL_POSITIONS } from '../queries/lendingPool';
import { LendingPool, Position } from '../types/generated';
import { handleSubgraphError } from '../client';

export function useLendingPoolData(poolId: string) {
    const [result] = useQuery({
        query: GET_LENDING_POOL,
        variables: { poolId },
    });

    const { data, fetching, error } = result;

    if (error) handleSubgraphError(error);

    return {
        pool: data?.lendingPool as LendingPool | undefined,
        isLoading: fetching,
        error,
    };
}

export function useUserPositions(userId: string) {
    const [result] = useQuery({
        query: GET_USER_POSITIONS,
        variables: { userId },
    });

    const { data, fetching, error } = result;

    if (error) handleSubgraphError(error);

    return {
        positions: data?.positions as Position[] | undefined,
        isLoading: fetching,
        error,
    };
}

export function usePoolPositions(poolId: string) {
    const [result] = useQuery({
        query: GET_POOL_POSITIONS,
        variables: { poolId },
    });

    const { data, fetching, error } = result;

    if (error) handleSubgraphError(error);

    return {
        positions: data?.positions as Position[] | undefined,
        isLoading: fetching,
        error,
    };
}