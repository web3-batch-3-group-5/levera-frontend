import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Address } from 'viem';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address?: Address | null): string {
  if (!address) return '0x0000...0000';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
