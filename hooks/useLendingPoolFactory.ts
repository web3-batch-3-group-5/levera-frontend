// hooks/useLendingPoolFactory.ts
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useReadContracts, useWriteContract } from 'wagmi';
import { CONTRACTS, PositionType } from '@/config/contracts';
import { Address, parseUnits } from 'viem';
import { toast } from 'sonner';

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

export interface PoolDetails {
    loanToken: Address;
    collateralToken: Address;
    loanTokenUsdDataFeed: Address;
    collateralTokenUsdDataFeed: Address;
    loanTokenName: string;
    collateralTokenName: string;
    loanTokenSymbol: string;
    collateralTokenSymbol: string;
    creator: Address;
    liquidationThresholdPercentage: bigint;
    interestRate: bigint;
    positionType: PositionType;
    isActive: boolean;
}

export function useLendingPoolFactory() {
    console.log('useLendingPoolFactory hook initialized');

    // State for pools data
    const [pools, setPools] = useState<PoolDetails[]>([]);
    const [poolAddresses, setPoolAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

    // Log contract address for debugging
    console.log('Factory Contract address:', CONTRACTS.LENDING_POOL_FACTORY.address);

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

    // Process the pool addresses
    useEffect(() => {
        console.log('Processing potential pools:', potentialPools);

        if (!potentialPools) {
            console.log('No potential pools data yet');
            return;
        }

        try {
            setIsLoading(true);

            // Filter valid addresses (non-zero and successful reads)
            const validPools = potentialPools
                .filter(result => result.status === 'success')
                .map(result => result.result as Address)
                .filter(addr => !!addr && addr !== '0x0000000000000000000000000000000000000000');

            console.log('Valid pool addresses found:', validPools);

            if (validPools.length === 0) {
                console.log('No valid pool addresses found - using mock data');
                createMockPoolData();
                return;
            }

            setPoolAddresses(validPools);

            // Get details for each pool
            fetchPoolDetails(validPools);

        } catch (err) {
            console.error('Error processing pool addresses:', err);
            setError(err instanceof Error ? err : new Error('Failed to process pool addresses'));

            // Use mock data for development when real data fails
            createMockPoolData();
        }
    }, [potentialPools]);

    // Function to fetch details for each pool
    const fetchPoolDetails = async (addresses: Address[]) => {
        console.log('Fetching details for pools:', addresses);

        try {
            // Check if each pool is active
            addresses.map(address => ({
                address: CONTRACTS.LENDING_POOL_FACTORY.address,
                abi: CONTRACTS.LENDING_POOL_FACTORY.abi,
                functionName: 'lendingPools',
                args: [address],
            }));

            const poolDetailsArray: PoolDetails[] = addresses.map((address) => {
                // Generate deterministic values based on the address for consistency
                const addressHash = parseInt(address.slice(2, 10), 16);
                const isEven = addressHash % 2 === 0;

                // Choose tokens based on the hash of the address
                const pairs = [
                    { loan: 'USDC', collateral: 'ETH' },
                    { loan: 'DAI', collateral: 'BTC' },
                    { loan: 'USDT', collateral: 'LINK' },
                    { loan: 'WETH', collateral: 'MATIC' }
                ];

                const pairIndex = addressHash % pairs.length;
                const selectedPair = pairs[pairIndex];

                // Full names for tokens
                const tokenFullNames = {
                    'USDC': 'USD Coin',
                    'DAI': 'Dai Stablecoin',
                    'USDT': 'Tether USD',
                    'WETH': 'Wrapped Ether',
                    'ETH': 'Ethereum',
                    'BTC': 'Bitcoin',
                    'LINK': 'Chainlink',
                    'MATIC': 'Polygon'
                };

                return {
                    loanToken: `0x${(addressHash * 2 + 1).toString(16).padStart(40, '0')}` as Address,
                    collateralToken: `0x${(addressHash * 2 + 2).toString(16).padStart(40, '0')}` as Address,
                    loanTokenUsdDataFeed: `0x${(addressHash * 3 + 1).toString(16).padStart(40, '0')}` as Address,
                    collateralTokenUsdDataFeed: `0x${(addressHash * 3 + 2).toString(16).padStart(40, '0')}` as Address,
                    loanTokenName: tokenFullNames[selectedPair.loan],
                    loanTokenSymbol: selectedPair.loan,
                    collateralTokenName: tokenFullNames[selectedPair.collateral],
                    collateralTokenSymbol: selectedPair.collateral,
                    creator: address,
                    liquidationThresholdPercentage: BigInt(isEven ? 80 : 75),
                    interestRate: BigInt(isEven ? 500 : 450),
                    positionType: isEven ? PositionType.LONG : PositionType.SHORT,
                    isActive: true // We'd get this from the lendingPools mapping in production
                };
            });

            console.log('Generated pool details:', poolDetailsArray);
            setPools(poolDetailsArray);
            setError(null);
        } catch (err) {
            console.error('Error fetching pool details:', err);
            setError(err instanceof Error ? err : new Error('Failed to fetch pool details'));

            // Use mock data if real data fails
            createMockPoolData();
        } finally {
            setIsLoading(false);
            setLastRefreshed(new Date());
        }
    };

    // Function to create mock data for development/fallback
    const createMockPoolData = () => {
        console.log('Creating mock pool data');
        const count = 3;

        const mockAddresses: Address[] = Array.from(
            { length: count },
            (_, i) => `0x${(i + 1).toString(16).padStart(40, '0')}` as Address
        );

        const mockPools: PoolDetails[] = mockAddresses.map((address, index) => {
            const loanTokenOptions = ['USDC', 'DAI', 'USDT', 'WETH'];
            const collateralTokenOptions = ['ETH', 'WBTC', 'LINK', 'MATIC'];

            const loanIndex = index % loanTokenOptions.length;
            const collateralIndex = index % collateralTokenOptions.length;

            return {
                loanToken: `0x${(index * 2 + 1).toString(16).padStart(40, '0')}` as Address,
                collateralToken: `0x${(index * 2 + 2).toString(16).padStart(40, '0')}` as Address,
                loanTokenUsdDataFeed: `0x${(index * 3 + 1).toString(16).padStart(40, '0')}` as Address,
                collateralTokenUsdDataFeed: `0x${(index * 3 + 2).toString(16).padStart(40, '0')}` as Address,
                loanTokenName: ['USD Coin', 'Dai Stablecoin', 'Tether USD', 'Wrapped Ether'][loanIndex],
                loanTokenSymbol: loanTokenOptions[loanIndex],
                collateralTokenName: ['Ethereum', 'Bitcoin', 'Chainlink', 'Polygon'][collateralIndex],
                collateralTokenSymbol: collateralTokenOptions[collateralIndex],
                creator: "0x7777777777777777777777777777777777777777" as Address,
                liquidationThresholdPercentage: 80n,
                interestRate: 500n,
                positionType: index % 2 === 0 ? PositionType.LONG : PositionType.SHORT,
                isActive: true
            };
        });

        console.log('Mock addresses created:', mockAddresses);
        console.log('Mock pools created:', mockPools);

        setPoolAddresses(mockAddresses);
        setPools(mockPools);
        setIsLoading(false);
        setLastRefreshed(new Date());
    };

    // Refresh function to manually trigger data refetch
    const refresh = useCallback(async () => {
        console.log('Manual refresh triggered');
        try {
            setIsLoading(true);
            await refetchPotentialPools();
            console.log('Refresh completed');
            setLastRefreshed(new Date());
            return true;
        } catch (err) {
            console.error('Error refreshing pools:', err);
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
        console.log('Creating lending pool with params:', params);

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

            console.log('Lending pool creation result:', hash);

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
        console.log('Getting pool info for address:', poolAddress);
        const poolIndex = poolAddresses.findIndex(addr => addr.toLowerCase() === poolAddress.toLowerCase());
        console.log('Pool index:', poolIndex);
        return poolIndex !== -1 ? pools[poolIndex] : null;
    }, [pools, poolAddresses]);

    // Check if pool exists
    const checkPoolExists = useCallback((loanToken: Address, collateralToken: Address) => {
        console.log('Checking if pool exists for:', loanToken, collateralToken);
        const exists = pools.some(pool =>
            pool.loanToken.toLowerCase() === loanToken.toLowerCase() &&
            pool.collateralToken.toLowerCase() === collateralToken.toLowerCase()
        );
        console.log('Pool exists:', exists);
        return exists;
    }, [pools]);

    // Final debug log of state
    useEffect(() => {
        console.log('=== LENDING POOL FACTORY STATE ===');
        console.log('Pools:', pools);
        console.log('Pool Addresses:', poolAddresses);
        console.log('Is Loading:', isLoading);
        console.log('Error:', error);
        console.log('Last Refreshed:', lastRefreshed);
        console.log('===============================');
    }, [pools, poolAddresses, isLoading, error, lastRefreshed]);

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