'use client';

import { useCallback } from 'react';
import { useReadContract, useWriteContract } from 'wagmi';
import { Address, formatUnits } from 'viem';
import { positionABI } from '@/lib/abis/position';

export function usePosition(positionAddress: Address) {
    const { writeContract, isPending: isWritePending } = useWriteContract();

    // Read position data
    const { data: baseCollateral } = useReadContract({
        address: positionAddress,
        abi: positionABI,
        functionName: 'baseCollateral',
    });

    const { data: effectiveCollateral } = useReadContract({
        address: positionAddress,
        abi: positionABI,
        functionName: 'effectiveCollateral',
    });

    const { data: borrowShares } = useReadContract({
        address: positionAddress,
        abi: positionABI,
        functionName: 'borrowShares',
    });

    const { data: leverage } = useReadContract({
        address: positionAddress,
        abi: positionABI,
        functionName: 'leverage',
    });

    const { data: liquidationPrice } = useReadContract({
        address: positionAddress,
        abi: positionABI,
        functionName: 'liquidationPrice',
    });

    const { data: health } = useReadContract({
        address: positionAddress,
        abi: positionABI,
        functionName: 'health',
    });

    const { data: ltv } = useReadContract({
        address: positionAddress,
        abi: positionABI,
        functionName: 'ltv',
    });

    const { data: lastUpdated } = useReadContract({
        address: positionAddress,
        abi: positionABI,
        functionName: 'lastUpdated',
    });

    const { data: lendingPoolAddress } = useReadContract({
        address: positionAddress,
        abi: positionABI,
        functionName: 'lendingPool',
    });

    // Position actions
    const addCollateral = useCallback(async (amount: bigint) => {
        try {
            return await writeContract({
                address: positionAddress,
                abi: positionABI,
                functionName: 'addCollateral',
                args: [amount],
            });
        } catch (err) {
            console.error('Error adding collateral:', err);
            throw err;
        }
    }, [writeContract, positionAddress]);

    const borrow = useCallback(async (amount: bigint) => {
        try {
            return await writeContract({
                address: positionAddress,
                abi: positionABI,
                functionName: 'borrow',
                args: [amount],
            });
        } catch (err) {
            console.error('Error borrowing from position:', err);
            throw err;
        }
    }, [writeContract, positionAddress]);

    const closePosition = useCallback(async () => {
        try {
            return await writeContract({
                address: positionAddress,
                abi: positionABI,
                functionName: 'closePosition',
                args: [],
            });
        } catch (err) {
            console.error('Error closing position:', err);
            throw err;
        }
    }, [writeContract, positionAddress]);

    const withdrawCollateral = useCallback(async (amount: bigint) => {
        try {
            return await writeContract({
                address: positionAddress,
                abi: positionABI,
                functionName: 'withdrawCollateral',
                args: [amount],
            });
        } catch (err) {
            console.error('Error withdrawing collateral:', err);
            throw err;
        }
    }, [writeContract, positionAddress]);

    const updateLeverage = useCallback(async (newLeverage: number) => {
        try {
            // Convert leverage to basis points (e.g., 1.5 -> 150)
            const leverageBps = BigInt(Math.floor(newLeverage * 100));

            return await writeContract({
                address: positionAddress,
                abi: positionABI,
                functionName: 'updateLeverage',
                args: [leverageBps],
            });
        } catch (err) {
            console.error('Error updating leverage:', err);
            throw err;
        }
    }, [writeContract, positionAddress]);

    // Derived/formatted values
    const formattedValues = {
        baseCollateral: baseCollateral ? formatUnits(baseCollateral, 18) : '0',
        effectiveCollateral: effectiveCollateral ? formatUnits(effectiveCollateral, 18) : '0',
        borrowShares: borrowShares ? formatUnits(borrowShares, 18) : '0',
        leverage: leverage ? Number(leverage) / 100 : 1, // Convert from basis points to decimal
        liquidationPrice: liquidationPrice ? formatUnits(liquidationPrice, 18) : '0',
        health: health ? Number(health) / 100 : 0, // Assuming health is in basis points
        ltv: ltv ? Number(ltv) / 10000 : 0, // Assuming LTV is in basis points
        lastUpdated: lastUpdated ? new Date(Number(lastUpdated) * 1000) : new Date(),
    };

    return {
        // Raw values
        baseCollateral,
        effectiveCollateral,
        borrowShares,
        leverage,
        liquidationPrice,
        health,
        ltv,
        lastUpdated,
        lendingPoolAddress,

        // Formatted values
        formattedValues,

        // Position actions
        addCollateral,
        borrow,
        closePosition,
        withdrawCollateral,
        updateLeverage,

        // Loading states
        isWritePending,
    };
}