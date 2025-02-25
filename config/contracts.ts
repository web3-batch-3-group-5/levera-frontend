// config/contracts.ts

import { Address } from 'viem';
import { lendingPoolFactoryABI } from '@/lib/abis/lendingPoolFactory';
import { lendingPoolABI } from '@/lib/abis/lendingPool';
import { positionFactoryABI } from '@/lib/abis/positionFactory';
import { positionABI } from '@/lib/abis/position';

export const CONTRACTS = {
    LENDING_POOL_FACTORY: {
        address: "0x4e0524Bd8cE75de87f15B08CFc13B3cBF7B388Bf" as Address,
        abi: lendingPoolFactoryABI,
    },
    POSITION_FACTORY: {
        address: "0x7bf71912432c89f154f6a5c6b029d6ea046ecc91" as Address,
        abi: positionFactoryABI,
    },
    LENDING_POOL: {
        abi: lendingPoolABI,
    },
    POSITION: {
        abi: positionABI,
    },
} as const;

export enum PositionType {
    LONG = 0,
    SHORT = 1
}

export interface CreateLendingPoolParams {
    loanToken: Address;
    collateralToken: Address;
    loanTokenUsdDataFeed: Address;
    collateralTokenUsdDataFeed: Address;
    liquidationThresholdPercentage: bigint;
    interestRate: bigint;
    positionType: PositionType;
}

export interface PoolDetails {
    loanToken: Address;
    collateralToken: Address;
    loanTokenUsdDataFeed: Address;
    collateralTokenUsdDataFeed: Address;
    loanTokenName: string;
    collateralTokenName: string;
    loanTokenSymbol: string;
    collateralTokenSymbol: string;
    creator: Address;
    liquidationThresholdPercentage: bigint;
    interestRate: bigint;
    positionType: PositionType;
    isActive: boolean;
}