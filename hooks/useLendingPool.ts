'use client';

import { useCallback, useMemo } from 'react';
import { 
  useReadContracts,
  useWriteContract, 
  useAccount 
} from 'wagmi';
import { Address, zeroAddress } from 'viem';
import { lendingPoolABI } from '@/lib/abis/lendingPool';

type ContractDataResult = {
  totalSupplyAssets?: bigint;
  totalSupplyShares?: bigint;
  totalBorrowAssets?: bigint;
  totalBorrowShares?: bigint;
  interestRate?: bigint;
  ltp?: bigint;
  userSupplyShares?: bigint;
};

export function useLendingPool(poolAddress: Address) {
  const { address: userAddress } = useAccount();
  
  // Batch all read calls into a single request
  const contracts = useMemo(() => [
    { functionName: 'totalSupplyAssets' },
    { functionName: 'totalSupplyShares' },
    { functionName: 'totalBorrowAssets' },
    { functionName: 'totalBorrowShares' },
    { functionName: 'interestRate' },
    { functionName: 'ltp' },
    ...(userAddress ? [{
      functionName: 'userSupplyShares',
      args: [userAddress]
    }] : [])
  ].map(config => ({
    address: poolAddress,
    abi: lendingPoolABI,
    ...config
  })), [poolAddress, userAddress]);

  const { 
    data: rawData, 
    isLoading, 
    error 
  } = useReadContracts({
    contracts,
    query: {
      select: (data) => ({
        totalSupplyAssets: data[0]?.result,
        totalSupplyShares: data[1]?.result,
        totalBorrowAssets: data[2]?.result,
        totalBorrowShares: data[3]?.result,
        interestRate: data[4]?.result,
        ltp: data[5]?.result,
        userSupplyShares: data[6]?.result
      } as ContractDataResult)
    }
  });

  // Unified write contract handler
  const { writeContract, isPending } = useWriteContract();

  const handleWriteCall = useCallback(
    async (functionName: 'supply' | 'withdraw', args: [bigint]) => {
      try {
        return await writeContract({
          address: poolAddress,
          abi: lendingPoolABI,
          functionName,
          args
        });
      } catch (err) {
        console.error(`Error in ${functionName}:`, err);
        throw err;
      }
    },
    [writeContract, poolAddress]
  );

  // Memoized actions
  const supply = useCallback(
    (amount: bigint) => handleWriteCall('supply', [amount]),
    [handleWriteCall]
  );

  const withdraw = useCallback(
    (shares: bigint) => handleWriteCall('withdraw', [shares]),
    [handleWriteCall]
  );

  return {
    // Pool data
    totalSupplyAssets: rawData?.totalSupplyAssets,
    totalSupplyShares: rawData?.totalSupplyShares,
    totalBorrowAssets: rawData?.totalBorrowAssets,
    totalBorrowShares: rawData?.totalBorrowShares,
    interestRate: rawData?.interestRate,
    ltp: rawData?.ltp,
    
    // User data
    userSupplyShares: rawData?.userSupplyShares,
    
    // Actions
    supply,
    withdraw,
    
    // State management
    isLoading,
    error,
    isPending,
  };
}
