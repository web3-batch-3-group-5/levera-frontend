// lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Address, formatUnits } from 'viem';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: Address): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export const formatTokenAmount = (amount: bigint | undefined, decimals: number = 18) => {
  if (!amount) return '0.00';
  return Number(formatUnits(amount, decimals)).toLocaleString(undefined, {
      maximumFractionDigits: 6,
      minimumFractionDigits: 2
  });
};

