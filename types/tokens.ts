import { BaseEntity, ValidAddress } from './common';

/**
 * Token-related type definitions
 */

// Base token interface
export interface Token extends BaseEntity {
  address: ValidAddress;
  name: string;
  symbol: string;
  decimals: number;
  logoUrl?: string;
  isActive: boolean;
}

// Token metadata from contract calls
export interface TokenMetadata {
  address: ValidAddress;
  name: string;
  symbol: string;
  decimals: number;
}

// Token balance information
export interface TokenBalance {
  token: Token;
  balance: bigint;
  formattedBalance: string;
  usdValue?: string;
  lastUpdated: number;
}

// Token price information
export interface TokenPrice {
  token: Token;
  usdPrice: string;
  priceChange24h?: string;
  priceChangePercentage24h?: number;
  lastUpdated: number;
  source: 'chainlink' | 'coingecko' | 'cache';
}

// Token pair for trading
export interface TokenPair {
  baseToken: Token;
  quoteToken: Token;
  pairAddress?: ValidAddress;
  isActive: boolean;
}

// Token allowance information
export interface TokenAllowance {
  token: Token;
  owner: ValidAddress;
  spender: ValidAddress;
  allowance: bigint;
  formattedAllowance: string;
  isUnlimited: boolean;
}

// Token approval request
export interface TokenApprovalRequest {
  token: Token;
  spender: ValidAddress;
  amount: bigint;
  formattedAmount: string;
}

// Token list for dropdowns/selectors
export interface TokenListItem {
  value: string; // token address
  label: string; // token symbol
  description?: string; // token name
  icon?: string; // token logo url
  disabled?: boolean;
  balance?: string;
  usdValue?: string;
}

// Token validation result
export interface TokenValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  token?: Token;
}

// Supported tokens enum (can be extended)
export enum SupportedTokens {
  LA_DAI = 'LA_DAI',
  LA_USDC = 'LA_USDC',
  LA_USDT = 'LA_USDT',
  LA_WBTC = 'LA_WBTC',
  LA_WETH = 'LA_WETH',
}

// Token metadata cache
export type TokenMetadataCache = Record<string, TokenMetadata>;

// Token balance cache
export type TokenBalanceCache = Record<ValidAddress, Record<string, TokenBalance>>;

// Token operations
export interface TokenOperations {
  transfer: (to: ValidAddress, amount: bigint) => Promise<string>;
  approve: (spender: ValidAddress, amount: bigint) => Promise<string>;
  balanceOf: (owner: ValidAddress) => Promise<bigint>;
  allowance: (owner: ValidAddress, spender: ValidAddress) => Promise<bigint>;
}

// Token hook return types
export interface UseTokenReturn {
  token: Token | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export interface UseTokenBalanceReturn {
  balance: TokenBalance | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export interface UseTokenMetadataReturn {
  data: TokenMetadataCache;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refreshCache: () => void;
  getCacheState: () => {
    updatedAt: number | undefined;
    isStale: boolean;
  };
}
