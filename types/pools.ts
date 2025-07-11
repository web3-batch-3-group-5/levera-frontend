import { AsyncState, BaseEntity, BigIntString, PercentageString, ValidAddress } from './common';
import { Token } from './tokens';

/**
 * Lending Pool related type definitions
 */

// Position type enum
export enum PositionType {
  LONG = 0,
  SHORT = 1,
}

// Base lending pool interface
export interface LendingPool extends BaseEntity {
  address: ValidAddress;
  loanToken: Token;
  collateralToken: Token;
  loanTokenUsdDataFeed: ValidAddress;
  collateralTokenUsdDataFeed: ValidAddress;
  creator: ValidAddress;
  liquidationThresholdPercentage: bigint;
  interestRate: bigint;
  positionType: PositionType;
  isActive: boolean;

  // Additional computed fields
  totalSupplyAssets?: bigint;
  totalSupplyShares?: bigint;
  totalBorrowAssets?: bigint;
  totalBorrowShares?: bigint;
  utilizationRate?: number;
  supplyAPY?: number;
  borrowAPY?: number;
}

// Pool details for display (formatted values)
export interface PoolDetails {
  loanToken: ValidAddress;
  collateralToken: ValidAddress;
  loanTokenUsdDataFeed: ValidAddress;
  collateralTokenUsdDataFeed: ValidAddress;
  loanTokenName: string;
  collateralTokenName: string;
  loanTokenSymbol: string;
  collateralTokenSymbol: string;
  loanTokenDecimals: number;
  collateralTokenDecimals: number;
  creator: ValidAddress;
  liquidationThresholdPercentage: bigint;
  interestRate: bigint;
  positionType: PositionType;
  isActive: boolean;
}

// Pool creation parameters
export interface CreateLendingPoolParams {
  loanToken: ValidAddress;
  collateralToken: ValidAddress;
  loanTokenUsdDataFeed: ValidAddress;
  collateralTokenUsdDataFeed: ValidAddress;
  liquidationThresholdPercentage: bigint; // Value as percentage (e.g., "80" for 80%)
  interestRate: bigint; // Value in basis points (e.g., "500" for 5%)
  positionType: PositionType;
}

// Pool statistics
export interface PoolStatistics {
  totalValueLocked: BigIntString;
  totalBorrowed: BigIntString;
  utilizationRate: PercentageString;
  supplyAPY: PercentageString;
  borrowAPY: PercentageString;
  activePositions: number;
  totalPositions: number;
  healthDistribution: {
    healthy: number;
    warning: number;
    critical: number;
  };
}

// Pool metrics for analytics
export interface PoolMetrics {
  pool: LendingPool;
  statistics: PoolStatistics;
  performance: {
    volume24h: BigIntString;
    volume7d: BigIntString;
    volume30d: BigIntString;
    fees24h: BigIntString;
    fees7d: BigIntString;
    fees30d: BigIntString;
  };
  lastUpdated: number;
}

// Pool operations
export interface PoolOperations {
  supply: (amount: bigint) => Promise<string>;
  withdraw: (shares: bigint) => Promise<string>;
  borrow: (amount: bigint) => Promise<string>;
  repay: (amount: bigint) => Promise<string>;
}

// Pool search/filter parameters
export interface PoolFilterParams {
  positionType?: PositionType;
  loanToken?: ValidAddress;
  collateralToken?: ValidAddress;
  minAPY?: number;
  maxAPY?: number;
  isActive?: boolean;
  creator?: ValidAddress;
  search?: string; // For token symbols or names
}

// Pool sorting options
export type PoolSortField =
  | 'createdAt'
  | 'totalSupplyAssets'
  | 'totalBorrowAssets'
  | 'interestRate'
  | 'utilizationRate'
  | 'supplyAPY'
  | 'borrowAPY';

// Pool card display data
export interface PoolCardData {
  pool: LendingPool;
  details: PoolDetails;
  statistics: PoolStatistics;
  userSupplyShares?: bigint;
  userSupplyAssets?: bigint;
  canInteract: boolean;
}

// Pool list item for dropdowns
export interface PoolListItem {
  value: string; // pool address
  label: string; // token pair display
  description?: string; // additional info
  disabled?: boolean;
  pool: LendingPool;
}

// Pool validation result
export interface PoolValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  estimatedGas?: bigint;
  estimatedAPY?: number;
}

// Hook return types
export interface UseLendingPoolReturn {
  // Pool data
  totalSupplyAssets?: bigint;
  totalSupplyShares?: bigint;
  totalBorrowAssets?: bigint;
  totalBorrowShares?: bigint;
  interestRate?: bigint;
  ltp?: bigint;

  // User data
  userSupplyShares?: bigint;

  // Operations
  supply: (amount: bigint) => Promise<string>;
  withdraw: (shares: bigint) => Promise<string>;

  // State
  isLoading: boolean;
  error: Error | null;
  isPending: boolean;
}

export interface UseLendingPoolFactoryReturn {
  pools: PoolDetails[];
  poolAddresses: ValidAddress[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  createPool: (params: CreateLendingPoolParams) => Promise<string>;
  isPending: boolean;
  refetch: () => Promise<void>;
}

// Contract data result from hooks
export interface ContractDataResult {
  totalSupplyAssets?: bigint;
  totalSupplyShares?: bigint;
  totalBorrowAssets?: bigint;
  totalBorrowShares?: bigint;
  interestRate?: bigint;
  ltp?: bigint;
  userSupplyShares?: bigint;
}

// Pool state for components
export interface PoolState extends AsyncState<LendingPool> {
  statistics?: PoolStatistics;
  userPosition?: {
    supplyShares: bigint;
    supplyAssets: bigint;
    borrowShares: bigint;
    borrowAssets: bigint;
  };
}
