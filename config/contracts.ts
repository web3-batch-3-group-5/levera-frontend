import { Address } from 'viem';
import { lendingPoolFactoryABI } from '@/lib/abis/lendingPoolFactory';

export const CONTRACTS = {
    LENDING_POOL_FACTORY: {
        address: "0x9B8918cABf1D4838d988F7d9D459c1ABE3Af3a6D" as Address,
        abi: lendingPoolFactoryABI,
    },
} as const;

export type BasePoolParams = {
    loanToken: Address;
    collateralToken: Address;
    loanTokenUsdDataFeed: Address;
    collateralTokenUsdDataFeed: Address;
};

export type PoolDetails = {
    loanToken: Address;
    collateralToken: Address;
    loanTokenUsdDataFeed: Address;
    collateralTokenUsdDataFeed: Address;
    loanTokenName: string;
    collateralTokenName: string;
    loanTokenSymbol: string;
    collateralTokenSymbol: string;
    creator: Address;
    isActive: boolean;
};