'use client';

import { useCallback, useState, useEffect } from 'react';
import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { Address } from 'viem';
import { CONTRACTS } from '@/config/contracts';
import { toast } from 'sonner';
import { usePosition } from '@/hooks/usePosition';

// Extended position type for internal use
interface PositionData {
    address: Address;
    lendingPoolAddress?: Address;
    healthFactor?: number;
    leverage?: number;
    liquidationPrice?: string;
}

export function usePositionFactory() {
    const { address: userAddress, isConnected } = useAccount();
    const [userPositions, setUserPositions] = useState<PositionData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Read positions directly from the contract
    const { data: positionAddresses, isLoading: isLoadingAddresses, refetch: refetchPositionAddresses } = useReadContract({
        address: CONTRACTS.POSITION_FACTORY.address,
        abi: CONTRACTS.POSITION_FACTORY.abi,
        functionName: 'getUserPositions',
        args: [userAddress || '0x0000000000000000000000000000000000000000' as Address],
        query: {
            enabled: !!userAddress && isConnected,
        }
    });

    const { writeContract, isPending: isCreatingPosition } = useWriteContract();

    // Load user positions
    useEffect(() => {
        const fetchPositionDetails = async () => {
            if (!userAddress || !isConnected || !positionAddresses || positionAddresses.length === 0) {
                setUserPositions([]);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);

            try {
                // Create basic position objects with addresses
                const positionsWithAddresses: PositionData[] = positionAddresses.map(address => ({
                    address,
                    // Position data will be loaded from the position contract
                }));
                
                setUserPositions(positionsWithAddresses);
                setError(null);
            } catch (err) {
                console.error('Error fetching user positions:', err);
                setError(err instanceof Error ? err : new Error('Failed to fetch positions'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchPositionDetails();
    }, [userAddress, isConnected, positionAddresses]);

    // Refresh function to manually trigger data refetch
    const refresh = useCallback(async () => {
        try {
            setIsLoading(true);
            await refetchPositionAddresses();
            return true;
        } catch (err) {
            console.error('Error refreshing positions:', err);
            setError(err instanceof Error ? err : new Error('Failed to refresh positions'));
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [refetchPositionAddresses]);

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

    // Get a position by address
    const getPositionByAddress = useCallback((positionAddress: Address) => {
        return userPositions.find(position => 
            position.address.toLowerCase() === positionAddress.toLowerCase()
        );
    }, [userPositions]);

    // Get positions for a specific lending pool
    const getPositionsByLendingPool = useCallback((lendingPoolAddress: Address) => {
        return userPositions.filter(position => 
            position.lendingPoolAddress?.toLowerCase() === lendingPoolAddress.toLowerCase()
        );
    }, [userPositions]);

    return {
        // Position state
        userPositions,
        isLoading,
        error,
        
        // Position actions
        createPosition,
        deletePosition,
        getPositionByAddress,
        getPositionsByLendingPool,
        refresh,

        // Loading states
        isCreatingPosition,
    };
}