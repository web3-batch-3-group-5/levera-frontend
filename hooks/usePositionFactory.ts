// hooks/usePositionFactory.ts
'use client';

import { useCallback, useState, useEffect } from 'react';
import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { Address } from 'viem';
import { CONTRACTS } from '@/config/contracts';
import { toast } from 'sonner';
import { Position } from '@/graphql/types';

// Extended position type for internal use
interface ExtendedPosition extends Position {
    // If address isn't in the original Position type, add it here
    address?: Address;
}

export function usePositionFactory() {
    const { address: userAddress } = useAccount();
    const [userPositions, setUserPositions] = useState<Position[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const { writeContract, isPending: isCreatingPosition } = useWriteContract();

    // Check if a position exists for a given lending pool and user
    const { data: positionExists, refetch: refetchPosition } = useReadContract({
        address: CONTRACTS.POSITION_FACTORY.address,
        abi: CONTRACTS.POSITION_FACTORY.abi,
        functionName: 'positions',
        args: [
            userAddress || '0x0000000000000000000000000000000000000000' as Address,
            userAddress || '0x0000000000000000000000000000000000000000' as Address
        ],
        query: {
            enabled: !!userAddress,
        }
    });

    // Load user positions
    useEffect(() => {
        const fetchUserPositions = async () => {
            if (!userAddress) {
                setUserPositions([]);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);

            try {
                // In a real app, this would fetch from your subgraph or other data source
                // For now, we'll create some dummy positions
                const dummyPositions: Position[] = [
                    {
                        id: '1',
                        user: userAddress,
                        collateralAmount: '1000000000000000000', // 1 Token
                        borrowedAmount: '500000000000000000', // 0.5 Token
                        healthFactor: '144', // 1.44
                        liquidationPrice: '850000000000000000', // 0.85 Token
                        leverage: '150', // 1.5x
                        createdAt: (Math.floor(Date.now() / 1000) - 3600).toString(), // 1 hour ago
                        pool: {
                            id: '1',
                            loanToken: {
                                symbol: 'USDC',
                                decimals: 6
                            },
                            collateralToken: {
                                symbol: 'ETH',
                                decimals: 18
                            }
                        }
                    },
                    {
                        id: '2',
                        user: userAddress,
                        collateralAmount: '5000000000000000000', // 5 Token
                        borrowedAmount: '2000000000000000000', // 2 Token
                        healthFactor: '157', // 1.57
                        liquidationPrice: '350000000000000000', // 0.35 Token
                        leverage: '140', // 1.4x
                        createdAt: (Math.floor(Date.now() / 1000) - 86400).toString(), // 1 day ago
                        pool: {
                            id: '2',
                            loanToken: {
                                symbol: 'DAI',
                                decimals: 18
                            },
                            collateralToken: {
                                symbol: 'BTC',
                                decimals: 8
                            }
                        }
                    },

                    // Add more dummy positions here if needed
                ];

                setUserPositions(dummyPositions);
                setError(null);
            } catch (err) {
                console.error('Error fetching user positions:', err);
                setError(err instanceof Error ? err : new Error('Failed to fetch positions'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserPositions();
    }, [userAddress]);

    // Refresh function to manually trigger data refetch
    const refresh = useCallback(async () => {
        try {
            setIsLoading(true);

            // In a real app, this would refetch from your subgraph or other data source
            // For now, we'll just simulate a delay
            await new Promise(resolve => setTimeout(resolve, 500));

            await refetchPosition();

            // Since we're using dummy data, update the lastUpdated timestamp to simulate refresh
            setUserPositions(prev => prev.map(position => ({
                ...position,
                createdAt: Math.floor(Date.now() / 1000).toString()
            })));

            setError(null);
            return true;
        } catch (err) {
            console.error('Error refreshing positions:', err);
            setError(err instanceof Error ? err : new Error('Failed to refresh positions'));
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [refetchPosition]);

    // Create a new position
    const createPosition = useCallback(async (
        lendingPoolAddress: Address,
        baseCollateral: bigint,
        leverage: number, // Leverage as a decimal number (e.g., 1.5 for 1.5x leverage)
    ) => {
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

            toast.dismiss('create-position');
            toast.success('Position created! Updating data...');

            // Refresh positions after creation
            setTimeout(() => {
                refresh();
            }, 2000); // Wait for transaction to be indexed

            return hash;
        } catch (err) {
            console.error('Error creating position:', err);
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
    }, [writeContract, userAddress, refresh]);

    // Delete a position
    const deletePosition = useCallback(async (
        lendingPoolAddress: Address,
        onBehalf: Address = userAddress as Address,
    ) => {
        if (!userAddress) throw new Error('Wallet not connected');

        try {
            toast.loading('Closing position...', { id: 'close-position' });

            const hash = await writeContract({
                address: CONTRACTS.POSITION_FACTORY.address,
                abi: CONTRACTS.POSITION_FACTORY.abi,
                functionName: 'deletePosition',
                args: [lendingPoolAddress, onBehalf],
            });

            toast.dismiss('close-position');
            toast.success('Position closed successfully!');

            // Refresh positions after deletion
            setTimeout(() => {
                refresh();
            }, 2000); // Wait for transaction to be indexed

            return hash;
        } catch (err) {
            console.error('Error deleting position:', err);
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
    }, [writeContract, userAddress, refresh]);

    // Get a position by ID
    const getPositionById = useCallback((positionId: string) => {
        return userPositions.find(position => position.id === positionId);
    }, [userPositions]);

    // Get positions by lending pool id
    const getPositionsByPoolId = useCallback((poolId: string) => {
        return userPositions.filter(position =>
            position.pool.id === poolId
        );
    }, [userPositions]);

    // Map position ID to position address (for components that need address)
    const getPositionAddressById = useCallback((positionId: string): Address => {
        // This is a mock function - in a real app, you would have a proper mapping
        // or fetch this from the blockchain
        return `0x${positionId.padStart(40, '0')}` as Address;
    }, []);

    return {
        // Position state
        userPositions,
        isLoading,
        error,
        positionExists,

        // Position actions
        createPosition,
        deletePosition,
        getPositionById,
        getPositionsByPoolId,
        getPositionAddressById,
        refresh,

        // Loading states
        isCreatingPosition,
    };
}