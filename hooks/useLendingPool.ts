'use client';

import { useCallback } from 'react';
import { useReadContract, useWriteContract, useSimulateContract, type Config } from 'wagmi';
import { Address } from 'viem';
import { lendingPoolABI } from '@/lib/abis/lendingPool';

export function useLendingPool(poolAddress: Address) {
    // Read total supply and borrow info
    const { data: totalSupplyAssets } = useReadContract({
        address: poolAddress,
        abi: lendingPoolABI,
        functionName: 'totalSupplyAssets',
    });

    const { data: totalSupplyShares } = useReadContract({
        address: poolAddress,
        abi: lendingPoolABI,
        functionName: 'totalSupplyShares',
    });

    const { data: totalBorrowAssets } = useReadContract({
        address: poolAddress,
        abi: lendingPoolABI,
        functionName: 'totalBorrowAssets',
    });

    const { data: totalBorrowShares } = useReadContract({
        address: poolAddress,
        abi: lendingPoolABI,
        functionName: 'totalBorrowShares',
    });

    const { data: borrowRate } = useReadContract({
        address: poolAddress,
        abi: lendingPoolABI,
        functionName: 'borrowRate',
    });

    // Supply functionality
    const supplySimulation = useSimulateContract({
        address: poolAddress,
        abi: lendingPoolABI,
        functionName: 'supply',
    });

    const { writeContract: writeSupply, isPending: isSupplyPending } = useWriteContract({
        config: supplySimulation.data?.request as Config | undefined,
    });

    const supply = useCallback(async (amount: bigint) => {
        if (!writeSupply) throw new Error('Contract not initialized');

        try {
            return await writeSupply({
                address: poolAddress,
                abi: lendingPoolABI,
                functionName: 'supply',
                args: [amount],
            });
        } catch (err) {
            console.error('Error supplying to pool:', err);
            throw err;
        }
    }, [writeSupply, poolAddress]);

    // Withdraw functionality
    const withdrawSimulation = useSimulateContract({
        address: poolAddress,
        abi: lendingPoolABI,
        functionName: 'withdraw',
    });

    const { writeContract: writeWithdraw, isPending: isWithdrawPending } = useWriteContract({
        config: withdrawSimulation.data?.request as Config | undefined,
    });

    const withdraw = useCallback(async (shares: bigint) => {
        if (!writeWithdraw) throw new Error('Contract not initialized');

        try {
            return await writeWithdraw({
                address: poolAddress,
                abi: lendingPoolABI,
                functionName: 'withdraw',
                args: [shares],
            });
        } catch (err) {
            console.error('Error withdrawing from pool:', err);
            throw err;
        }
    }, [writeWithdraw, poolAddress]);

    return {
        // Read values
        totalSupplyAssets,
        totalSupplyShares,
        totalBorrowAssets,
        totalBorrowShares,
        borrowRate,

        // Write functions
        supply,
        withdraw,

        // Loading states
        isSupplyPending,
        isWithdrawPending,
    };
}