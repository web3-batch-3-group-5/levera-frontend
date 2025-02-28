// config/contracts.ts

import { Address } from 'viem';
import { lendingPoolFactoryABI } from '@/lib/abis/lendingPoolFactory';
import { lendingPoolABI } from '@/lib/abis/lendingPool';
import { positionFactoryABI } from '@/lib/abis/positionFactory';
import { positionABI } from '@/lib/abis/position';

export const CONTRACTS = {
    LENDING_POOL_FACTORY: {
        address: "0x2E5ecCdf0b72d1d8e901256ee87BE20A82Fb5e6f" as Address,
        abi: lendingPoolFactoryABI,
    },
    POSITION_FACTORY: {
        address: "0xc9175BD38e587aEe78C79c8203818Fea0C20fECF" as Address,
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