// config/contracts.ts

import { Address } from 'viem';
import { lendingPoolFactoryABI } from '@/lib/abis/lendingPoolFactory';
import { lendingPoolABI } from '@/lib/abis/lendingPool';
import { positionFactoryABI } from '@/lib/abis/positionFactory';
import { positionABI } from '@/lib/abis/position';

export const CONTRACTS = {
    LENDING_POOL_FACTORY: {
        // address: "0x17A55ead5D71f7ADBE24d90F3901F87E9601EB1A" as Address, // flame
        address: "0xAb559D5A18e3D8764B24A49bE65cB762F12bb3F2" as Address, // arbitrum-sepolia
        abi: lendingPoolFactoryABI,
    },
    POSITION_FACTORY: {
        // address: "0x991de844C6A42AC2D4Bb6B97cE4fCf28296b8B84" as Address, // flame
        address: "0x7BF71912432C89F154F6A5C6B029D6ea046ecC91" as Address, // arbitrum-sepolia
        abi: positionFactoryABI,
    },
    LENDING_POOL: {
        abi: lendingPoolABI,
    },
    POSITION: {
        abi: positionABI,
    },
} as const;