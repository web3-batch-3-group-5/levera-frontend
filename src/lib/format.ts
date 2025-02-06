import { formatUnits, parseUnits } from 'viem'
import { TOKENS } from '@/constants/tokens'

export function formatUSDC(value: bigint | undefined): string {
    if (!value) return '0'
    return Number(formatUnits(value, TOKENS.USDC.decimals)).toFixed(2)
}

export function formatWBTC(value: bigint | undefined): string {
    if (!value) return '0'
    return Number(formatUnits(value, TOKENS.WBTC.decimals)).toFixed(4)
}

export function parseUSDC(value: string): bigint {
    try {
        return parseUnits(value, TOKENS.USDC.decimals)
    } catch {
        return 0n
    }
}

export function parseWBTC(value: string): bigint {
    try {
        return parseUnits(value, TOKENS.WBTC.decimals)
    } catch {
        return 0n
    }
}