'use client';

import { useCallback } from 'react';
import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { Address, zeroAddress } from 'viem';
import { lendingPoolABI } from '@/lib/abis/lendingPool';

export function useLendingPool(poolAddress: Address) {
    const { address: userAddress } = useAccount();

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

    const { data: totalCollateral } = useReadContract({
        address: poolAddress,
        abi: lendingPoolABI,
        functionName: 'totalCollateral',
    });

    const { data: interestRate } = useReadContract({
        address: poolAddress,
        abi: lendingPoolABI,
        functionName: 'interestRate',
    });

    const { data: ltp } = useReadContract({
        address: poolAddress,
        abi: lendingPoolABI,
        functionName: 'ltp',
    });

    const { data: positionType } = useReadContract({
        address: poolAddress,
        abi: lendingPoolABI,
        functionName: 'positionType',
    });

    const { data: utilizationRate } = useReadContract({
        address: poolAddress,
        abi: lendingPoolABI,
        functionName: 'getUtilizationRate',
    });

    // Read user position info
    const { data: userPosition } = useReadContract({
        address: poolAddress,
        abi: lendingPoolABI,
        functionName: 'userPositions',
        args: [userAddress || zeroAddress],
    });

    const { data: userSupplyShares } = useReadContract({
        address: poolAddress,
        abi: lendingPoolABI,
        functionName: 'userSupplyShares',
        args: [userAddress || zeroAddress],
    });

    // Supply functionality
    const { writeContract: writeSupply, isPending: isSupplyPending } = useWriteContract();

    const supply = useCallback(async (amount: bigint) => {
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

    // Margin position functionality
    const { writeContract: writeRegisterPosition, isPending: isRegisteringPosition } = useWriteContract();

    const registerPosition = useCallback(async (onBehalf: Address) => {
        try {
            return await writeRegisterPosition({
                address: poolAddress,
                abi: lendingPoolABI,
                functionName: 'registerPosition',
                args: [onBehalf],
            });
        } catch (err) {
            console.error('Error registering position:', err);
            throw err;
        }
    }, [writeRegisterPosition, poolAddress]);

    // Supply collateral by position
    const { writeContract: writeSupplyCollateral, isPending: isSupplyingCollateral } = useWriteContract();

    const supplyCollateral = useCallback(async (onBehalf: Address, amount: bigint) => {
        try {
            return await writeSupplyCollateral({
                address: poolAddress,
                abi: lendingPoolABI,
                functionName: 'supplyCollateralByPosition',
                args: [onBehalf, amount],
            });
        } catch (err) {
            console.error('Error supplying collateral:', err);
            throw err;
        }
    }, [writeSupplyCollateral, poolAddress]);

    // Borrow by position
    const { writeContract: writeBorrowByPosition, isPending: isBorrowingByPosition } = useWriteContract();

    const borrowByPosition = useCallback(async (onBehalf: Address, amount: bigint) => {
        try {
            return await writeBorrowByPosition({
                address: poolAddress,
                abi: lendingPoolABI,
                functionName: 'borrowByPosition',
                args: [onBehalf, amount],
            });
        } catch (err) {
            console.error('Error borrowing by position:', err);
            throw err;
        }
    }, [writeBorrowByPosition, poolAddress]);

    // Repay by position
    const { writeContract: writeRepayByPosition, isPending: isRepayingByPosition } = useWriteContract();

    const repayByPosition = useCallback(async (onBehalf: Address, shares: bigint) => {
        try {
            return await writeRepayByPosition({
                address: poolAddress,
                abi: lendingPoolABI,
                functionName: 'repayByPosition',
                args: [onBehalf, shares],
            });
        } catch (err) {
            console.error('Error repaying position:', err);
            throw err;
        }
    }, [writeRepayByPosition, poolAddress]);

    // Withdraw collateral by position
    const { writeContract: writeWithdrawCollateral, isPending: isWithdrawingCollateral } = useWriteContract();

    const withdrawCollateral = useCallback(async (onBehalf: Address, amount: bigint) => {
        try {
            return await writeWithdrawCollateral({
                address: poolAddress,
                abi: lendingPoolABI,
                functionName: 'withdrawCollateralByPosition',
                args: [onBehalf, amount],
            });
        } catch (err) {
            console.error('Error withdrawing collateral:', err);
            throw err;
        }
    }, [writeWithdrawCollateral, poolAddress]);

    // Unregister position
    const { writeContract: writeUnregisterPosition, isPending: isUnregisteringPosition } = useWriteContract();

    const unregisterPosition = useCallback(async (onBehalf: Address) => {
        try {
            return await writeUnregisterPosition({
                address: poolAddress,
                abi: lendingPoolABI,
                functionName: 'unregisterPosition',
                args: [onBehalf],
            });
        } catch (err) {
            console.error('Error unregistering position:', err);
            throw err;
        }
    }, [writeUnregisterPosition, poolAddress]);

    return {
        // Read values
        totalSupplyAssets,
        totalSupplyShares,
        totalBorrowAssets,
        totalBorrowShares,
        totalCollateral,
        interestRate,
        ltp,
        positionType,
        utilizationRate,
        userPosition,
        userSupplyShares,

        // Write functions
        supply,
        withdraw,
        registerPosition,
        supplyCollateral,
        borrowByPosition,
        repayByPosition,
        withdrawCollateral,
        unregisterPosition,

        // Loading states
        isSupplyPending,
        isWithdrawPending,
        isRegisteringPosition,
        isSupplyingCollateral,
        isBorrowingByPosition,
        isRepayingByPosition,
        isWithdrawingCollateral,
        isUnregisteringPosition,
    };
}