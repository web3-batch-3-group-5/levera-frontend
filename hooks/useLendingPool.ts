'use client';

import { useCallback } from 'react';
import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { Address, zeroAddress } from 'viem';
import { lendingPoolABI } from '@/lib/abis/lendingPool';

export function useLendingPool(poolAddress: Address) {
    const { address: userAddress } = useAccount();

    // Read total supply and borrow info
    const { data: totalSupplyAssets, isLoading: isLoadingSupply, error: supplyError } = useReadContract({
        address: poolAddress,
        abi: lendingPoolABI,
        functionName: 'totalSupplyAssets',
    });

    const { data: totalSupplyShares } = useReadContract({
        address: poolAddress,
        abi: lendingPoolABI,
        functionName: 'totalSupplyShares',
    });

    const { data: totalBorrowAssets, isLoading: isLoadingBorrow, error: borrowError } = useReadContract({
        address: poolAddress,
        abi: lendingPoolABI,
        functionName: 'totalBorrowAssets',
    });

    const { data: totalBorrowShares } = useReadContract({
        address: poolAddress,
        abi: lendingPoolABI,
        functionName: 'totalBorrowShares',
    });

    const { data: interestRate, isLoading: isLoadingInterestRate, error: interestRateError } = useReadContract({
        address: poolAddress,
        abi: lendingPoolABI,
        functionName: 'interestRate',
    });

    const { data: ltp } = useReadContract({
        address: poolAddress,
        abi: lendingPoolABI,
        functionName: 'ltp',
    });

    // User-specific data if user is connected
    const { data: userSupplyShares } = useReadContract({
        address: poolAddress,
        abi: lendingPoolABI,
        functionName: 'userSupplyShares',
        args: [userAddress || zeroAddress],
        query: {
            enabled: !!userAddress,
        }
    });

    // Supply functionality
    const { writeContract, isPending: isSupplyPending } = useWriteContract();

    const supply = useCallback(async (amount: bigint) => {
        try {
            return await writeContract({
                address: poolAddress,
                abi: lendingPoolABI,
                functionName: 'supply',
                args: [amount],
            });
        } catch (err) {
            console.error('Error supplying to pool:', err);
            throw err;
        }
    }, [writeContract, poolAddress]);

    // Withdraw functionality
    const { writeContract: writeWithdraw, isPending: isWithdrawPending } = useWriteContract();

    const withdraw = useCallback(async (shares: bigint) => {
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

    // Combine errors
    const error = supplyError || borrowError || interestRateError;
    const isLoading = isLoadingSupply || isLoadingBorrow || isLoadingInterestRate;

    return {
        // Pool data
        totalSupplyAssets,
        totalSupplyShares,
        totalBorrowAssets,
        totalBorrowShares,
        interestRate,
        ltp,
        
        // User data
        userSupplyShares,
        
        // Actions
        supply,
        withdraw,
        
        // Loading and error states
        isLoading,
        error,
        isSupplyPending,
        isWithdrawPending,
    };
}