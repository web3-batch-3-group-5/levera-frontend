import { ValidAddress, BigIntString, PercentageString, SortDirection } from './common';
import { PositionType } from './pools';

/**
 * GraphQL related type definitions
 */

// Base GraphQL response
export interface GraphQLResponse<T = any> {
  data: T;
  errors?: GraphQLError[];
  extensions?: Record<string, any>;
}

// GraphQL error
export interface GraphQLError {
  message: string;
  locations?: Array<{
    line: number;
    column: number;
  }>;
  path?: Array<string | number>;
  extensions?: Record<string, any>;
}

// GraphQL variables
export interface GraphQLVariables {
  [key: string]: any;
}

// GraphQL query options
export interface GraphQLQueryOptions {
  query: string;
  variables?: GraphQLVariables;
  operationName?: string;
  context?: Record<string, any>;
}

// Token entity from GraphQL
export interface GraphQLToken {
  id: string;
  address: ValidAddress;
  symbol: string;
  name: string;
  decimals: number;
  totalSupply?: BigIntString;
  createdAt: string;
  updatedAt: string;
}

// Pool entity from GraphQL
export interface GraphQLPool {
  id: string;
  address: ValidAddress;
  loanToken: GraphQLToken;
  collateralToken: GraphQLToken;
  totalSupplyAssets: BigIntString;
  totalBorrowAssets: BigIntString;
  totalSupplyShares: BigIntString;
  totalBorrowShares: BigIntString;
  interestRate: BigIntString;
  liquidationThresholdPercentage: BigIntString;
  positionType: PositionType;
  creator: ValidAddress;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Computed fields
  utilizationRate?: PercentageString;
  supplyAPY?: PercentageString;
  borrowAPY?: PercentageString;

  // Relations
  positions?: GraphQLPosition[];
  supplies?: GraphQLSupply[];
  borrows?: GraphQLBorrow[];
}

// Position entity from GraphQL
export interface GraphQLPosition {
  id: string;
  address: ValidAddress;
  owner: ValidAddress;
  lendingPool: GraphQLPool;
  baseCollateral: BigIntString;
  effectiveCollateral: BigIntString;
  borrowAmount: BigIntString;
  borrowShares: BigIntString;
  leverage: BigIntString;
  liquidationPrice: BigIntString;
  health: BigIntString;
  ltv: BigIntString;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastUpdated: string;

  // Relations
  transactions?: GraphQLTransaction[];
  liquidations?: GraphQLLiquidation[];
}

// Supply entity from GraphQL
export interface GraphQLSupply {
  id: string;
  user: ValidAddress;
  pool: GraphQLPool;
  shares: BigIntString;
  assets: BigIntString;
  timestamp: string;
  blockNumber: BigIntString;
  transactionHash: string;
}

// Borrow entity from GraphQL
export interface GraphQLBorrow {
  id: string;
  user: ValidAddress;
  pool: GraphQLPool;
  shares: BigIntString;
  assets: BigIntString;
  timestamp: string;
  blockNumber: BigIntString;
  transactionHash: string;
}

// Transaction entity from GraphQL
export interface GraphQLTransaction {
  id: string;
  hash: string;
  from: ValidAddress;
  to: ValidAddress;
  value: BigIntString;
  gasUsed: BigIntString;
  gasPrice: BigIntString;
  blockNumber: BigIntString;
  blockHash: string;
  timestamp: string;
  type:
    | 'supply'
    | 'withdraw'
    | 'borrow'
    | 'repay'
    | 'create_position'
    | 'modify_position'
    | 'close_position'
    | 'liquidate';

  // Relations
  position?: GraphQLPosition;
  pool?: GraphQLPool;
}

// Liquidation entity from GraphQL
export interface GraphQLLiquidation {
  id: string;
  position: GraphQLPosition;
  liquidator: ValidAddress;
  collateralLiquidated: BigIntString;
  debtRepaid: BigIntString;
  liquidationBonus: BigIntString;
  timestamp: string;
  blockNumber: BigIntString;
  transactionHash: string;
}

// User entity from GraphQL
export interface GraphQLUser {
  id: ValidAddress;
  address: ValidAddress;
  totalSupplied: BigIntString;
  totalBorrowed: BigIntString;
  totalPositions: number;
  activePositions: number;
  totalLiquidations: number;
  createdAt: string;
  lastActivity: string;

  // Relations
  positions?: GraphQLPosition[];
  supplies?: GraphQLSupply[];
  borrows?: GraphQLBorrow[];
  transactions?: GraphQLTransaction[];
}

// Platform statistics from GraphQL
export interface GraphQLPlatformStats {
  totalValueLocked: BigIntString;
  totalBorrowed: BigIntString;
  totalSupplied: BigIntString;
  totalPools: number;
  totalPositions: number;
  totalUsers: number;
  totalLiquidations: number;
  volume24h: BigIntString;
  volume7d: BigIntString;
  volume30d: BigIntString;
  fees24h: BigIntString;
  fees7d: BigIntString;
  fees30d: BigIntString;
  updatedAt: string;
}

// Query response types
export interface PoolsResponse {
  pools: GraphQLPool[];
}

export interface PositionsResponse {
  positions: GraphQLPosition[];
}

export interface PositionResponse {
  position: GraphQLPosition;
}

export interface PoolResponse {
  pool: GraphQLPool;
}

export interface UserResponse {
  user: GraphQLUser;
}

export interface PlatformStatsResponse {
  platformStats: GraphQLPlatformStats;
}

export interface TransactionsResponse {
  transactions: GraphQLTransaction[];
}

export interface LiquidationsResponse {
  liquidations: GraphQLLiquidation[];
}

// Query parameters
export interface PoolsQueryParams {
  first?: number;
  skip?: number;
  orderBy?: Pool_OrderBy;
  orderDirection?: SortDirection;
  where?: PoolWhereInput;
}

export interface PositionsQueryParams {
  first?: number;
  skip?: number;
  orderBy?: Position_OrderBy;
  orderDirection?: SortDirection;
  where?: PositionWhereInput;
}

export interface TransactionsQueryParams {
  first?: number;
  skip?: number;
  orderBy?: Transaction_OrderBy;
  orderDirection?: SortDirection;
  where?: TransactionWhereInput;
}

// Where input types
export interface PoolWhereInput {
  id?: string;
  address?: ValidAddress;
  loanToken?: string;
  collateralToken?: string;
  positionType?: PositionType;
  creator?: ValidAddress;
  isActive?: boolean;
  createdAt_gt?: string;
  createdAt_lt?: string;
  totalSupplyAssets_gt?: BigIntString;
  totalSupplyAssets_lt?: BigIntString;
  interestRate_gt?: BigIntString;
  interestRate_lt?: BigIntString;
}

export interface PositionWhereInput {
  id?: string;
  address?: ValidAddress;
  owner?: ValidAddress;
  lendingPool?: string;
  isActive?: boolean;
  createdAt_gt?: string;
  createdAt_lt?: string;
  baseCollateral_gt?: BigIntString;
  baseCollateral_lt?: BigIntString;
  leverage_gt?: BigIntString;
  leverage_lt?: BigIntString;
  health_gt?: BigIntString;
  health_lt?: BigIntString;
}

export interface TransactionWhereInput {
  id?: string;
  hash?: string;
  from?: ValidAddress;
  to?: ValidAddress;
  type?: string;
  position?: string;
  pool?: string;
  timestamp_gt?: string;
  timestamp_lt?: string;
  blockNumber_gt?: BigIntString;
  blockNumber_lt?: BigIntString;
}

// Order by types
export type Pool_OrderBy =
  | 'id'
  | 'address'
  | 'createdAt'
  | 'updatedAt'
  | 'totalSupplyAssets'
  | 'totalBorrowAssets'
  | 'interestRate'
  | 'liquidationThresholdPercentage'
  | 'utilizationRate'
  | 'supplyAPY'
  | 'borrowAPY';

export type Position_OrderBy =
  | 'id'
  | 'address'
  | 'createdAt'
  | 'updatedAt'
  | 'lastUpdated'
  | 'baseCollateral'
  | 'effectiveCollateral'
  | 'borrowAmount'
  | 'borrowShares'
  | 'leverage'
  | 'liquidationPrice'
  | 'health'
  | 'ltv';

export type Transaction_OrderBy = 'id' | 'hash' | 'timestamp' | 'blockNumber' | 'value' | 'gasUsed' | 'gasPrice';

// Subscription types
export interface PoolSubscription {
  pool: GraphQLPool;
  type: 'CREATED' | 'UPDATED' | 'DELETED';
}

export interface PositionSubscription {
  position: GraphQLPosition;
  type: 'CREATED' | 'UPDATED' | 'DELETED';
}

export interface TransactionSubscription {
  transaction: GraphQLTransaction;
  type: 'CREATED';
}

// GraphQL client configuration
export interface GraphQLClientConfig {
  endpoint: string;
  headers?: Record<string, string>;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  cache?: boolean;
  cacheTimeout?: number;
}

// GraphQL hook options
export interface GraphQLHookOptions {
  enabled?: boolean;
  refetchInterval?: number;
  refetchIntervalInBackground?: boolean;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
  refetchOnReconnect?: boolean;
  retry?: number | boolean;
  retryDelay?: number;
  staleTime?: number;
  gcTime?: number;
  suspense?: boolean;
  throwOnError?: boolean;
  select?: (data: any) => any;
  onSuccess?: (data: any) => void;
  onError?: (error: GraphQLError) => void;
  onSettled?: (data: any, error: GraphQLError | null) => void;
}

// GraphQL mutation options
export interface GraphQLMutationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: GraphQLError) => void;
  onSettled?: (data: any, error: GraphQLError | null) => void;
  retry?: number | boolean;
  retryDelay?: number;
}

// Legacy types for backward compatibility
export type OrderDirection = SortDirection;
export type Position_orderBy = Position_OrderBy;
export type Pool_orderBy = Pool_OrderBy;
