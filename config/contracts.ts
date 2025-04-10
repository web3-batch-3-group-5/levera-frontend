// config/contracts.ts

import { Address } from 'viem';
import { lendingPoolFactoryABI } from '@/lib/abis/lendingPoolFactory';
import { lendingPoolABI } from '@/lib/abis/lendingPool';
import { positionFactoryABI } from '@/lib/abis/positionFactory';
import { positionABI } from '@/lib/abis/position';

export const CONTRACTS = {
    LENDING_POOL_FACTORY: {
        address: "0x8F886450A284d2aC63483645A5Fb40c493023B99" as Address,
        abi: lendingPoolFactoryABI,
    },
    POSITION_FACTORY: {
        address: "0xeF9884A2295cE317A96cf8CF79aAd034586332F7" as Address,
        abi: positionFactoryABI,
    },
    LENDING_POOL: {
        abi: lendingPoolABI,
    },
    POSITION: {
        abi: positionABI,
    },
    TOKEN_ADDRESSES: [
        "0xe4e0BB3C56e735c72D6696B4F56B7251BB4ab35b", // LA_DAI
        "0x74B59C6C38AEA54644527aA0c5f8f4796e777533", // LA_USDC
        "0x5e4695a76Dc81ECc041576d672Da1208d6d8922B", // LA_USDT
        "0x919c586538EE34B87A12c584ba6463e7e12338E9", // LA_WBTC
        "0xe7d9E1dB89Ce03570CBA7f4C6Af80EC14a61d1db", // LA_WETH
    ]
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
    loanTokenDecimals: number;
    collateralTokenDecimals: number;
    creator: Address;
    liquidationThresholdPercentage: bigint;
    interestRate: bigint;
    positionType: PositionType;
    isActive: boolean;
}