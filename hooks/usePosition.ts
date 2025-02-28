'use client';

import { useCallback, useState, useEffect } from 'react';
import { useReadContract, useWriteContract } from 'wagmi';
import { Address, formatUnits, isAddress } from 'viem';
import { positionABI } from '@/lib/abis/position';
import { toast } from 'sonner';

export function usePosition(positionAddress: Address | string | undefined) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Improved address validation
    const isValidAddress = positionAddress && 
                          typeof positionAddress === 'string' && 
                          isAddress(positionAddress) &&
                          positionAddress !== '0x0000000000000000000000000000000000000000';
    
    // Convert to proper Address type if valid
    const validatedAddress = isValidAddress ? positionAddress as Address : undefined;

    console.log(`[usePosition] Initializing with address: ${positionAddress}, valid: ${isValidAddress}`);
    
    // Individual read contract calls for each property
    const { 
        data: baseCollateral,
        isLoading: isLoadingBaseCollateral,
        error: baseCollateralError,
        refetch: refetchBaseCollateral
    } = useReadContract({
        address: validatedAddress,
        abi: positionABI, 
        functionName: 'baseCollateral',
        query: {
            enabled: !!validatedAddress,
        }
    });

    const {
        data: effectiveCollateral,
        isLoading: isLoadingEffectiveCollateral, 
        error: effectiveCollateralError,
        refetch: refetchEffectiveCollateral
    } = useReadContract({
        address: validatedAddress,
        abi: positionABI,
        functionName: 'effectiveCollateral',
        query: {
            enabled: !!validatedAddress,
        }
    });

    const {
        data: borrowShares,
        isLoading: isLoadingBorrowShares,
        error: borrowSharesError,
        refetch: refetchBorrowShares
    } = useReadContract({
        address: validatedAddress,
        abi: positionABI,
        functionName: 'borrowShares',
        query: {
            enabled: !!validatedAddress,
        }
    });

    const {
        data: leverage,
        isLoading: isLoadingLeverage,
        error: leverageError,
        refetch: refetchLeverage
    } = useReadContract({
        address: validatedAddress,
        abi: positionABI,
        functionName: 'leverage',
        query: {
            enabled: !!validatedAddress,
        }
    });

    const {
        data: liquidationPrice,
        isLoading: isLoadingLiquidationPrice,
        error: liquidationPriceError,
        refetch: refetchLiquidationPrice
    } = useReadContract({
        address: validatedAddress,
        abi: positionABI,
        functionName: 'liquidationPrice',
        query: {
            enabled: !!validatedAddress,
        }
    });

    const {
        data: health,
        isLoading: isLoadingHealth,
        error: healthError,
        refetch: refetchHealth
    } = useReadContract({
        address: validatedAddress,
        abi: positionABI,
        functionName: 'health',
        query: {
            enabled: !!validatedAddress,
        }
    });

    const {
        data: ltv,
        isLoading: isLoadingLtv,
        error: ltvError,
        refetch: refetchLtv
    } = useReadContract({
        address: validatedAddress,
        abi: positionABI,
        functionName: 'ltv',
        query: {
            enabled: !!validatedAddress,
        }
    });

    const {
        data: lastUpdated,
        isLoading: isLoadingLastUpdated,
        refetch: refetchLastUpdated
    } = useReadContract({
        address: validatedAddress,
        abi: positionABI,
        functionName: 'lastUpdated',
        query: {
            enabled: !!validatedAddress,
        }
    });

    const {
        data: lendingPoolAddress,
        isLoading: isLoadingLendingPool,
        refetch: refetchLendingPool
    } = useReadContract({
        address: validatedAddress,
        abi: positionABI,
        functionName: 'lendingPool',
        query: {
            enabled: !!validatedAddress,
        }
    });

    // For contract writes
    const { writeContract, isPending: isWritePending } = useWriteContract();

    // Track overall loading state
    useEffect(() => {
        if (!validatedAddress) {
            setIsLoading(false);
            setError("Invalid position address");
            return;
        }

        const isLoadingAny = 
            isLoadingBaseCollateral || 
            isLoadingEffectiveCollateral || 
            isLoadingBorrowShares || 
            isLoadingLeverage || 
            isLoadingLiquidationPrice || 
            isLoadingHealth || 
            isLoadingLtv || 
            isLoadingLastUpdated ||
            isLoadingLendingPool;
        
        setIsLoading(isLoadingAny);
    }, [
        validatedAddress,
        isLoadingBaseCollateral,
        isLoadingEffectiveCollateral,
        isLoadingBorrowShares,
        isLoadingLeverage,
        isLoadingLiquidationPrice,
        isLoadingHealth,
        isLoadingLtv,
        isLoadingLastUpdated,
        isLoadingLendingPool
    ]);

    // Collect and process errors
    useEffect(() => {
        if (!validatedAddress) return;

        const errors = [
            baseCollateralError,
            effectiveCollateralError,
            borrowSharesError,
            leverageError,
            liquidationPriceError,
            healthError,
            ltvError
        ].filter(Boolean);

        if (errors.length > 0) {
            const errorMessage = errors[0]?.message || "Error fetching position data";
            console.error("Position data error:", errorMessage);
            setError(errorMessage);
        } else {
            setError(null);
        }
    }, [
        validatedAddress,
        baseCollateralError,
        effectiveCollateralError,
        borrowSharesError,
        leverageError,
        liquidationPriceError,
        healthError,
        ltvError
    ]);

    // Log data for debugging
    useEffect(() => {
        if (!validatedAddress) return;

        console.log("Position Contract Data:", {
            address: validatedAddress,
            baseCollateral,
            effectiveCollateral,
            borrowShares,
            leverage,
            liquidationPrice,
            health,
            ltv,
            lastUpdated,
            lendingPoolAddress
        });
    }, [
        validatedAddress,
        baseCollateral,
        effectiveCollateral,
        borrowShares,
        leverage,
        liquidationPrice,
        health,
        ltv,
        lastUpdated,
        lendingPoolAddress
    ]);

    // Refresh all data
    const refresh = useCallback(async () => {
        if (!validatedAddress) return;
        
        await Promise.all([
            refetchBaseCollateral(),
            refetchEffectiveCollateral(),
            refetchBorrowShares(),
            refetchLeverage(),
            refetchLiquidationPrice(),
            refetchHealth(),
            refetchLtv(),
            refetchLastUpdated(),
            refetchLendingPool()
        ]);
    }, [
        validatedAddress,
        refetchBaseCollateral,
        refetchEffectiveCollateral,
        refetchBorrowShares,
        refetchLeverage,
        refetchLiquidationPrice,
        refetchHealth,
        refetchLtv,
        refetchLastUpdated,
        refetchLendingPool
    ]);

    // Position actions
    const addCollateral = useCallback(async (amount: bigint) => {
        if (!validatedAddress) throw new Error("Invalid position address");
        
        try {
            return await writeContract({
                address: validatedAddress,
                abi: positionABI,
                functionName: 'addCollateral',
                args: [amount],
            });
        } catch (err) {
            console.error('Error adding collateral:', err);
            throw err;
        }
    }, [writeContract, validatedAddress]);

    const updateLeverage = useCallback(async (newLeverage: number) => {
        if (!validatedAddress) throw new Error("Invalid position address");
        
        try {
            // Convert leverage to basis points (e.g., 1.5 -> 150)
            const leverageBps = BigInt(Math.floor(newLeverage * 100));

            return await writeContract({
                address: validatedAddress,
                abi: positionABI,
                functionName: 'updateLeverage',
                args: [leverageBps],
            });
        } catch (err) {
            console.error('Error updating leverage:', err);
            throw err;
        }
    }, [writeContract, validatedAddress]);

    const closePosition = useCallback(async () => {
        if (!validatedAddress) throw new Error("Invalid position address");
        
        try {
            return await writeContract({
                address: validatedAddress,
                abi: positionABI,
                functionName: 'closePosition',
                args: [],
            });
        } catch (err) {
            console.error('Error closing position:', err);
            throw err;
        }
    }, [writeContract, validatedAddress]);

    const withdrawCollateral = useCallback(async (amount: bigint) => {
        if (!validatedAddress) throw new Error("Invalid position address");
        
        try {
            return await writeContract({
                address: validatedAddress,
                abi: positionABI,
                functionName: 'withdrawCollateral',
                args: [amount],
            });
        } catch (err) {
            console.error('Error withdrawing collateral:', err);
            throw err;
        }
    }, [writeContract, validatedAddress]);

    // Create formatted values for UI display
    const formattedValues = {
        baseCollateral: baseCollateral ? formatUnits(baseCollateral, 18) : '0',
        effectiveCollateral: effectiveCollateral ? formatUnits(effectiveCollateral, 18) : '0',
        borrowShares: borrowShares ? formatUnits(borrowShares, 18) : '0',
        leverage: leverage ? Number(leverage) / 100 : 1, // Convert from basis points to decimal
        liquidationPrice: liquidationPrice ? formatUnits(liquidationPrice, 18) : '0',
        health: health ? (Number(health) / 100).toFixed(2) : '0.00', // Assuming health is in basis points
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
        closePosition,
        withdrawCollateral,
        updateLeverage,
        refresh,

        // Status
        isLoading,
        isWritePending,
        error,
        isValid: !!validatedAddress
    };
}