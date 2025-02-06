import { 
    useReadContract,
    useWriteContract,
    useSimulateContract,
    UseReadContractParameters,
    UseWriteContractParameters
  } from 'wagmi'
import { lendingPoolABI } from '@/lib/mockABI'
import { formatUSDC, parseUSDC, formatWBTC } from '@/lib/format'
import { Address } from 'viem'

const LENDING_POOL_ADDRESS = "0xBeaB07B1EECA9B51BD32E90d68F6043eF3f71b0a";

export function useTotalSupplyAssets() {
    return useReadContract({
      address: LENDING_POOL_ADDRESS,
      abi: lendingPoolABI,
      functionName: "totalSupplyAssets",
    } as UseReadContractParameters)
  }

  export function useTotalBorrowAssets() {
    return useReadContract({
      address: LENDING_POOL_ADDRESS,
      abi: lendingPoolABI,
      functionName: "totalBorrowAssets",
    } as UseReadContractParameters)
  }
  
  export function useSupply() {
    const { data: simulation } = useSimulateContract({
      address: LENDING_POOL_ADDRESS,
      abi: lendingPoolABI,
      functionName: "supply",
    })
  
    return useWriteContract({
      mutation: {
        onSuccess: (data) => {
          console.log('Supply successful:', data)
        }
      }
    } as UseWriteContractParameters)
  }
