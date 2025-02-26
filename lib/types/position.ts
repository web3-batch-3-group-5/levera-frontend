import { Address } from 'viem';

export interface Token {
  id: string;
  address: Address;
  symbol: string;
  name: string;
  decimals: number;
}

export interface LendingPool {
  id: string;
  address: Address;
  loanToken: Token;
  collateralToken: Token;
  liquidationThresholdPercentage: bigint;
  interestRate: bigint;
  positionType: number;
  isActive: boolean;
  creator: Address;
}

export interface Position {
  id: string;
  address: Address;
  owner: Address;
  lendingPool: LendingPool;
  baseCollateral: string;
  effectiveCollateral: string;
  borrowAmount: string;
  leverage: string;
  liquidationPrice: string;
  health: string;
  ltv: string;
  lastUpdated: string;
  createdAt: string;
}

// Simplified position type for mock data or partial data from subgraph
export interface PositionSummary {
  id: string;
  address: Address;
  lendingPool: {
    address: Address;
    loanToken: {
      symbol: string;
      decimals: number;
    };
    collateralToken: {
      symbol: string;
      decimals: number;
    };
  };
}