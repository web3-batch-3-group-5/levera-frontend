// config/contracts.ts

import { Address } from 'viem';
import { lendingPoolFactoryABI } from '@/lib/abis/lendingPoolFactory';
import { positionFactoryABI } from '@/lib/abis/positionFactory';

export const CONTRACTS = {
    LENDING_POOL_FACTORY: {
        address: "0xc25482F6A71191A79E9ccd54205D66a9091DA5Fe" as Address,
        abi: lendingPoolFactoryABI,
    },
    POSITION_FACTORY: {
        address: "0x9799D2863dE4e0d203C7791d31354eE55169CE52" as Address,
        abi: positionFactoryABI,
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