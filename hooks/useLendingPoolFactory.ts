// hooks/useLendingPoolFactory.ts
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useReadContract, useReadContracts, useWriteContract } from 'wagmi';
import { CONTRACTS, PoolDetails, PositionType } from '@/config/contracts';
import { Address, parseUnits } from 'viem';
import { erc20Abi } from 'viem';
import { toast } from 'sonner';
import { lendingPoolABI } from '@/lib/abis/lendingPool';

// Types
export interface CreateLendingPoolParams {
    loanToken: Address;
    collateralToken: Address;
    loanTokenUsdDataFeed: Address;
    collateralTokenUsdDataFeed: Address;
    liquidationThresholdPercentage: string; // Value as percentage (e.g., "80" for 80%)
    interestRate: string; // Value in basis points (e.g., "500" for 5%)
    positionType: PositionType;
}

export function useLendingPoolFactory() {
    // console.log('useLendingPoolFactory hook initialized');

    // State for pools data
    const [pools, setPools] = useState<PoolDetails[]>([]);
    const [poolAddresses, setPoolAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

    // Log contract address for debugging
    // console.log('Factory Contract address:', CONTRACTS.LENDING_POOL_FACTORY.address);

    // We don't have a getPoolCount function, so we'll need to iterate through the array
    // and stop when we hit a zero address or encounter an error
    // Let's try to load the first 20 pools
    const { data: potentialPools, refetch: refetchPotentialPools } = useReadContracts({
        contracts: Array.from({ length: 20 }, (_, i) => ({
            address: CONTRACTS.LENDING_POOL_FACTORY.address,
            abi: CONTRACTS.LENDING_POOL_FACTORY.abi,
            functionName: 'createdLendingPools',
            args: [BigInt(i)],
        })),
        query: {
            staleTime: 60 * 1000, // 1 minute
        }
    });

    // Get pool status (active/inactive)
    const { data: poolStatusesData } = useReadContracts({
        contracts: poolAddresses.map(address => ({
            address: CONTRACTS.LENDING_POOL_FACTORY.address,
            abi: CONTRACTS.LENDING_POOL_FACTORY.abi,
            functionName: 'lendingPools',
            args: [address],
        })),
        query: {
            enabled: poolAddresses.length > 0,
        }
    });

    // Get pool basic details
    const { data: poolDetailsData } = useReadContracts({
        contracts: poolAddresses.flatMap(address => [
            {
                address,
                abi: lendingPoolABI,
                functionName: 'loanToken',
            },
            {
                address,
                abi: lendingPoolABI,
                functionName: 'collateralToken',
            },
            {
                address,
                abi: lendingPoolABI,
                functionName: 'loanTokenUsdDataFeed',
            },
            {
                address,
                abi: lendingPoolABI,
                functionName: 'collateralTokenUsdDataFeed',
            },
            {
                address,
                abi: lendingPoolABI,
                functionName: 'creator',
            },
            {
                address,
                abi: lendingPoolABI,
                functionName: 'interestRate',
            },
            {
                address,
                abi: lendingPoolABI,
                functionName: 'ltp',
            },
            {
                address,
                abi: lendingPoolABI,
                functionName: 'positionType',
            },
        ]),
        query: {
            enabled: poolAddresses.length > 0,
        }
    });

    // Process the pool addresses
    useEffect(() => {
        // console.log('Processing potential pools:', potentialPools);

        if (!potentialPools) {
            // console.log('No potential pools data yet');
            return;
        }

        try {
            setIsLoading(true);

            // Filter valid addresses (non-zero and successful reads)
            const validPools = potentialPools
                .filter(result => result.status === 'success')
                .map(result => result.result as Address)
                .filter(addr => !!addr && addr !== '0x0000000000000000000000000000000000000000');

            // console.log('Valid pool addresses found:', validPools);

            if (validPools.length === 0) {
                // console.log('No valid pool addresses found - using mock data');
                createMockPoolData();
                return;
            }

            setPoolAddresses(validPools);
        } catch (err) {
            // console.error('Error processing pool addresses:', err);
            setError(err instanceof Error ? err : new Error('Failed to process pool addresses'));

            // Use mock data for development when real data fails
            createMockPoolData();
        }
    }, [potentialPools]);

    // After getting basic pool data, fetch token details
    const [poolBasicDetails, setPoolBasicDetails] = useState<PoolDetails[]>([]);

    useEffect(() => {
        if (!poolDetailsData || !poolAddresses.length) {
            return;
        }

        try {
            const poolData: PoolDetails[] = poolAddresses.map((address, index) => {
                const baseIndex = index * 8; // 8 property queries per pool
                
                // Safely extract results, handling potential failures
                const getResult = <T>(idx: number, defaultValue: T): T => {
                    const response = poolDetailsData[baseIndex + idx];
                    return response?.status === 'success' ? response.result as T : defaultValue;
                };
                
                const loanToken = getResult<Address>(0, '0x0000000000000000000000000000000000000000' as Address);
                const collateralToken = getResult<Address>(1, '0x0000000000000000000000000000000000000000' as Address);
                const loanTokenUsdDataFeed = getResult<Address>(2, '0x0000000000000000000000000000000000000000' as Address);
                const collateralTokenUsdDataFeed = getResult<Address>(3, '0x0000000000000000000000000000000000000000' as Address);
                const creator = getResult<Address>(4, '0x0000000000000000000000000000000000000000' as Address);
                const interestRate = getResult<bigint>(5, 500n);
                const liquidationThresholdPercentage = getResult<bigint>(6, 80n);
                const positionType = getResult<PositionType>(7, PositionType.LONG);

                const isActive = poolStatusesData &&
                    poolStatusesData[index]?.status === 'success' &&
                    Boolean(poolStatusesData[index]?.result);

                return {
                    loanToken,
                    collateralToken,
                    loanTokenUsdDataFeed,
                    collateralTokenUsdDataFeed,
                    creator,
                    liquidationThresholdPercentage,
                    interestRate,
                    positionType,
                    isActive: isActive !== undefined ? isActive : true,
                    loanTokenName: 'Unknown Token',
                    loanTokenSymbol: 'UNKNOWN',
                    collateralTokenName: 'Unknown Token',
                    collateralTokenSymbol: 'UNKNOWN'
                };
            });
            setPoolBasicDetails(poolData);
        } catch (err) {
            console.error('Error processing pool details data:', err);
            setError(err instanceof Error ? err : new Error('Failed to process pool details'));

            createMockPoolData(poolAddresses);
        }
    }, [poolDetailsData, poolStatusesData, poolAddresses]);
                
                // Now fetch token names and symbols
    const { data: tokenDetailsData } = useReadContracts({
        contracts: poolBasicDetails.flatMap(pool => [
            // Loan token name
            {
                address: pool.loanToken,
                abi: erc20Abi,
                functionName: 'name',
            },
            // Loan token symbol
            {
                address: pool.loanToken,
                abi: erc20Abi,
                functionName: 'symbol',
            },
            // Loan token decimals
            {
                address: pool.loanToken,
                abi: erc20Abi,
                functionName: 'decimals',
            },
            // Collateral token name
            {
                address: pool.collateralToken,
                abi: erc20Abi,
                functionName: 'name',
            },
            // Collateral token symbol
            {
                address: pool.collateralToken,
                abi: erc20Abi,
                functionName: 'symbol',
            },
            // Collateral token decimals
            {
                address: pool.collateralToken,
                abi: erc20Abi,
                functionName: 'decimals',
            },
        ]),
        query: {
            enabled: poolBasicDetails.length > 0 && poolBasicDetails.some(pool => 
                !!pool.loanToken && pool.loanToken !== '0x0000000000000000000000000000000000000000' && 
                !!pool.collateralToken && pool.collateralToken !== '0x0000000000000000000000000000000000000000'
            ),
        }
    });

    // Process token details and complete pool data
    useEffect(() => {
        if (!tokenDetailsData || !poolBasicDetails.length) {
            return;
        }

        try {
            const completePools: PoolDetails[] = poolBasicDetails.map((pool, index) => {
                const baseIndex = index * 6; // 6 token queries per pool
                
                // Default values in case token queries fail
                let loanTokenName = 'Unknown Token';
                let loanTokenSymbol = 'UNKNOWN';
                let collateralTokenName = 'Unknown Token';
                let collateralTokenSymbol = 'UNKNOWN';
                
                // Extract token details if available
                if (tokenDetailsData[baseIndex]?.status === 'success') {
                    loanTokenName = tokenDetailsData[baseIndex].result as string;
                }
                
                if (tokenDetailsData[baseIndex + 1]?.status === 'success') {
                    loanTokenSymbol = tokenDetailsData[baseIndex + 1].result as string;
                }
                
                if (tokenDetailsData[baseIndex + 3]?.status === 'success') {
                    collateralTokenName = tokenDetailsData[baseIndex + 3].result as string;
                }
                
                if (tokenDetailsData[baseIndex + 4]?.status === 'success') {
                    collateralTokenSymbol = tokenDetailsData[baseIndex + 4].result as string;
                }
                
                return {
                    ...pool,
                    loanTokenName,
                    loanTokenSymbol,
                    collateralTokenName,
                    collateralTokenSymbol,
                } as PoolDetails;
            });

            // console.log('Processed pool details with token info:', completePools);
            setPools(completePools);
            setIsLoading(false);
            setError(null);
        } catch (err) {
            // console.error('Error processing token details:', err);
            setError(err instanceof Error ? err : new Error('Failed to process token details'));
            
            // Use mock data if processing fails
            createMockPoolData(poolAddresses);
        }
    }, [tokenDetailsData, poolBasicDetails]);

    // Function to create mock data for development/fallback
    const createMockPoolData = useCallback((addresses?: Address[]) => {
        console.log('Creating mock pool data');
        const count = addresses?.length || 3;

        const mockAddresses: Address[] = addresses || Array.from(
            { length: count },
            (_, i) => `0x${(i + 1).toString(16).padStart(40, '0')}` as Address
        );

        const mockPools: PoolDetails[] = mockAddresses.map((address, index) => {
            const loanTokenOptions = ['USDC', 'DAI', 'USDT', 'WETH'];
            const collateralTokenOptions = ['ETH', 'WBTC', 'LINK', 'MATIC'];

            const loanIndex = index % loanTokenOptions.length;
            const collateralIndex = index % collateralTokenOptions.length;

            const loanTokenFullNames: Record<string, string> = {
                'USDC': 'USD Coin',
                'DAI': 'Dai Stablecoin',
                'USDT': 'Tether USD',
                'WETH': 'Wrapped Ether'
            };

            const collateralTokenFullNames: Record<string, string> = {
                'ETH': 'Ethereum',
                'WBTC': 'Wrapped Bitcoin',
                'LINK': 'Chainlink',
                'MATIC': 'Polygon'
            };

            return {
                loanToken: `0x${(index * 2 + 1).toString(16).padStart(40, '0')}` as Address,
                collateralToken: `0x${(index * 2 + 2).toString(16).padStart(40, '0')}` as Address,
                loanTokenUsdDataFeed: `0x${(index * 3 + 1).toString(16).padStart(40, '0')}` as Address,
                collateralTokenUsdDataFeed: `0x${(index * 3 + 2).toString(16).padStart(40, '0')}` as Address,
                loanTokenName: loanTokenFullNames[loanTokenOptions[loanIndex]],
                loanTokenSymbol: loanTokenOptions[loanIndex],
                collateralTokenName: collateralTokenFullNames[collateralTokenOptions[collateralIndex]],
                collateralTokenSymbol: collateralTokenOptions[collateralIndex],
                creator: "0x7777777777777777777777777777777777777777" as Address,
                liquidationThresholdPercentage: 80n,
                interestRate: 500n,
                positionType: index % 2 === 0 ? PositionType.LONG : PositionType.SHORT,
                isActive: true
            };
        });

        // console.log('Mock addresses created:', mockAddresses);
        // console.log('Mock pools created:', mockPools);

        setPoolAddresses(mockAddresses);
        setPools(mockPools);
        setIsLoading(false);
        setLastRefreshed(new Date());
    }, []);

    // Refresh function to manually trigger data refetch
    const refresh = useCallback(async () => {
        // console.log('Manual refresh triggered');
        try {
            setIsLoading(true);
            await refetchPotentialPools();
            // console.log('Refresh completed');
            setLastRefreshed(new Date());
            return true;
        } catch (err) {
            // console.error('Error refreshing pools:', err);
            setError(err instanceof Error ? err : new Error('Failed to refresh pools'));
            return false;
        } finally {
            // Keep loading state for at least 500ms for better UX
            setTimeout(() => setIsLoading(false), 500);
        }
    }, [refetchPotentialPools]);

    // Create new pool
    const { writeContract, isPending: isCreatingPool } = useWriteContract();

    const createLendingPool = useCallback(async (params: CreateLendingPoolParams) => {
        // console.log('Creating lending pool with params:', params);

        try {
            const liquidationThreshold = parseUnits(params.liquidationThresholdPercentage, 0);
            const interestRate = parseUnits(params.interestRate, 0);

            const hash = await writeContract({
                address: CONTRACTS.LENDING_POOL_FACTORY.address,
                abi: CONTRACTS.LENDING_POOL_FACTORY.abi,
                functionName: 'createLendingPool',
                args: [
                    params.loanToken,
                    params.collateralToken,
                    params.loanTokenUsdDataFeed,
                    params.collateralTokenUsdDataFeed,
                    liquidationThreshold,
                    interestRate,
                    params.positionType
                ],
            });

            // console.log('Lending pool creation result:', hash);

            // Refresh the pools list after successful creation
            toast.promise(refresh(), {
                loading: 'Updating pool list...',
                success: 'Pool list updated',
                error: 'Failed to update pool list'
            });

            return hash;
        } catch (err) {
            console.error('Error creating lending pool:', err);
            throw err;
        }
    }, [writeContract, refresh]);

    // Get pool info by address
    const getPoolInfo = useCallback((poolAddress: Address) => {
        // console.log('Getting pool info for address:', poolAddress);
        const poolIndex = poolAddresses.findIndex(addr => addr.toLowerCase() === poolAddress.toLowerCase());
        // console.log('Pool index:', poolIndex);
        return poolIndex !== -1 ? pools[poolIndex] : null;
    }, [pools, poolAddresses]);

    // Check if pool exists
    const checkPoolExists = useCallback((loanToken: Address, collateralToken: Address) => {
        // console.log('Checking if pool exists for:', loanToken, collateralToken);
        const exists = pools.some(pool =>
            pool.loanToken.toLowerCase() === loanToken.toLowerCase() &&
            pool.collateralToken.toLowerCase() === collateralToken.toLowerCase()
        );
        // console.log('Pool exists:', exists);
        return exists;
    }, [pools]);

    // // Debug logging
    // useEffect(() => {
    //     console.log('=== LENDING POOL FACTORY STATE ===');
    //     console.log('Pools:', pools);
    //     console.log('Pool Addresses:', poolAddresses);
    //     console.log('Is Loading:', isLoading);
    //     console.log('Error:', error);
    //     console.log('Last Refreshed:', lastRefreshed);
    //     console.log('===============================');
    // }, [pools, poolAddresses, isLoading, error, lastRefreshed]);

    return {
        pools,
        poolAddresses,
        isLoading,
        error,
        lastRefreshed,
        refresh,
        createLendingPool,
        getPoolInfo,
        checkPoolExists,
        isCreatingPool,
    };
}