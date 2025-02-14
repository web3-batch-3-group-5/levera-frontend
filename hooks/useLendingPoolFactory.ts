'use client';

import { useCallback, useEffect, useState } from 'react';
import { useReadContracts, useSimulateContract, useWriteContract, type Config } from 'wagmi';
import { CONTRACTS, type BasePoolParams, type PoolDetails } from '@/config/contracts';
import { Address } from 'viem';

const MAX_POOLS_TO_FETCH = 10;

export function useLendingPoolFactory() {
    const [poolAddresses, setPoolAddresses] = useState<Address[]>([]);
    const [pools, setPools] = useState<PoolDetails[]>([]);
    const [isLoadingPools, setIsLoadingPools] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Step 1: Get array of pool addresses
    const { data: poolAddressesResult, isLoading: isLoadingAddresses } = useReadContracts({
        contracts: Array.from({ length: MAX_POOLS_TO_FETCH }, (_, i) => ({
            ...CONTRACTS.LENDING_POOL_FACTORY,
            functionName: 'createdLendingPools',
            args: [BigInt(i)],
        })),
    });

    // Process pool addresses
    useEffect(() => {
        if (poolAddressesResult) {
            const addresses = poolAddressesResult
                .map(result =>
                    result.status === 'success' && result.result ? result.result as Address : undefined
                )
                .filter((address): address is Address =>
                    !!address && address !== '0x0000000000000000000000000000000000000000'
                );

            setPoolAddresses(addresses);
        }
    }, [poolAddressesResult]);

    // Step 2: Get pool details for each address
    const { data: poolDetailsResults, isLoading: isLoadingDetails } = useReadContracts({
        contracts: poolAddresses.map(address => ({
            ...CONTRACTS.LENDING_POOL_FACTORY,
            functionName: 'lendingPools',
            args: [address],
        })),
    });

    // Process pool details
    useEffect(() => {
        if (poolDetailsResults) {
            try {
                const validPools = poolDetailsResults
                    .filter((result): result is { status: 'success'; result: never } =>
                        result.status === 'success' && !!result.result
                    )
                    .map(({ result }) => ({
                        loanToken: result[0],
                        collateralToken: result[1],
                        loanTokenUsdDataFeed: result[2],
                        collateralTokenUsdDataFeed: result[3],
                        loanTokenName: result[4],
                        collateralTokenName: result[5],
                        loanTokenSymbol: result[6],
                        collateralTokenSymbol: result[7],
                        creator: result[8],
                        isActive: result[9],
                    } as PoolDetails));

                setPools(validPools);
                setError(null);
            } catch (err) {
                console.error('Error processing pool details:', err);
                setError('Error processing pool details');
            } finally {
                setIsLoadingPools(false);
            }
        }
    }, [poolDetailsResults]);

    // Create pool functionality
    const simulation = useSimulateContract({
        ...CONTRACTS.LENDING_POOL_FACTORY,
        functionName: 'createLendingPool',
    });

    const { writeContract, isPending: isCreatingPool } = useWriteContract({
        config: simulation.data?.request as Config | undefined,
    });

    const createLendingPool = useCallback(async (params: BasePoolParams) => {
        if (!writeContract) {
            throw new Error('Contract not initialized');
        }

        try {
            const tx = await writeContract({
                address: CONTRACTS.LENDING_POOL_FACTORY.address,
                abi: CONTRACTS.LENDING_POOL_FACTORY.abi,
                functionName: 'createLendingPool',
                args: [
                    params.loanToken,
                    params.collateralToken,
                    params.loanTokenUsdDataFeed,
                    params.collateralTokenUsdDataFeed,
                ],
            });

            return tx;
        } catch (err) {
            console.error('Error creating lending pool:', err);
            throw err;
        }
    }, [writeContract]);

    return {
        poolAddresses,
        pools,
        isLoading: isLoadingPools || isLoadingAddresses || isLoadingDetails,
        error,
        createLendingPool,
        isCreatingPool,
    };
}