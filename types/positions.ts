import { AsyncState, BaseEntity, BigIntString, HealthStatus, PercentageString, ValidAddress } from './common';
import { LendingPool, PositionType } from './pools';

/**
 * Position related type definitions
 */

// Base position interface
export interface Position extends BaseEntity {
  address: ValidAddress;
  owner: ValidAddress;
  lendingPool: LendingPool;
  baseCollateral: BigIntString;
  effectiveCollateral: BigIntString;
  borrowAmount: BigIntString;
  borrowShares: BigIntString;
  leverage: BigIntString;
  liquidationPrice: BigIntString;
  health: BigIntString;
  ltv: BigIntString;
  isActive: boolean;
  lastUpdated: string;
}

// Position summary for listings
export interface PositionSummary {
  id: string;
  address: ValidAddress;
  owner: ValidAddress;
  lendingPool: {
    address: ValidAddress;
    loanToken: {
      symbol: string;
      decimals: number;
    };
    collateralToken: {
      symbol: string;
      decimals: number;
    };
    positionType: PositionType;
  };
  baseCollateral: BigIntString;
  borrowAmount: BigIntString;
  leverage: BigIntString;
  health: BigIntString;
  healthStatus: HealthStatus;
  lastUpdated: string;
  pnl?: {
    value: BigIntString;
    percentage: PercentageString;
    isPositive: boolean;
  };
}

// Position details for individual view
export interface PositionDetails extends Position {
  // Calculated values
  healthStatus: HealthStatus;
  liquidationRisk: 'low' | 'medium' | 'high' | 'critical';

  // Formatted values for display
  formattedValues: {
    baseCollateral: string;
    effectiveCollateral: string;
    borrowAmount: string;
    borrowShares: string;
    leverage: string;
    liquidationPrice: string;
    health: string;
    ltv: string;
  };

  // Additional metrics
  metrics: {
    currentPrice: BigIntString;
    entryPrice: BigIntString;
    pnlValue: BigIntString;
    pnlPercentage: PercentageString;
    marginRatio: PercentageString;
    interestAccrued: BigIntString;
    timeToLiquidation?: number; // seconds
  };
}

// Position creation parameters
export interface CreatePositionParams {
  lendingPool: ValidAddress;
  collateralAmount: bigint;
  borrowAmount: bigint;
  leverage?: number;
  slippageTolerance?: number;
  deadline?: number;
}

// Position modification parameters
export interface ModifyPositionParams {
  position: ValidAddress;
  action: 'add-collateral' | 'remove-collateral' | 'increase-leverage' | 'decrease-leverage';
  amount: bigint;
  slippageTolerance?: number;
  deadline?: number;
}

// Position close parameters
export interface ClosePositionParams {
  position: ValidAddress;
  closePercentage?: number; // 0-100, default 100
  slippageTolerance?: number;
  deadline?: number;
}

// Position operations
export interface PositionOperations {
  addCollateral: (amount: bigint) => Promise<string>;
  removeCollateral: (amount: bigint) => Promise<string>;
  increaseLeverage: (newLeverage: number) => Promise<string>;
  decreaseLeverage: (newLeverage: number) => Promise<string>;
  close: (percentage?: number) => Promise<string>;
}

// Position filters
export interface PositionFilterParams {
  owner?: ValidAddress;
  lendingPool?: ValidAddress;
  positionType?: PositionType;
  healthStatus?: HealthStatus[];
  minLeverage?: number;
  maxLeverage?: number;
  minCollateral?: bigint;
  maxCollateral?: bigint;
  isActive?: boolean;
  search?: string;
}

// Position sorting options
export type PositionSortField =
  | 'createdAt'
  | 'lastUpdated'
  | 'baseCollateral'
  | 'effectiveCollateral'
  | 'borrowAmount'
  | 'leverage'
  | 'health'
  | 'ltv'
  | 'pnl';

// Position analytics
export interface PositionAnalytics {
  position: Position;
  performance: {
    entryPrice: BigIntString;
    currentPrice: BigIntString;
    pnl: {
      value: BigIntString;
      percentage: PercentageString;
      isPositive: boolean;
    };
    roi: PercentageString;
    holdingPeriod: number; // seconds
  };
  risk: {
    healthStatus: HealthStatus;
    liquidationRisk: number; // 0-1
    timeToLiquidation?: number; // seconds
    maxDrawdown: PercentageString;
    volatility: PercentageString;
  };
  fees: {
    totalPaid: BigIntString;
    interestAccrued: BigIntString;
    tradingFees: BigIntString;
    gasFees: BigIntString;
  };
}

// Position card display data
export interface PositionCardData {
  position: Position;
  details: PositionDetails;
  analytics: PositionAnalytics;
  canModify: boolean;
  canClose: boolean;
  actions: {
    addCollateral: boolean;
    removeCollateral: boolean;
    adjustLeverage: boolean;
    close: boolean;
  };
}

// Position validation result
export interface PositionValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  estimatedGas?: bigint;
  estimatedLiquidationPrice?: bigint;
  estimatedHealth?: number;
  priceImpact?: number;
}

// Hook return types
export interface UsePositionReturn {
  baseCollateral?: bigint;
  effectiveCollateral?: bigint;
  borrowShares?: bigint;
  leverage?: bigint;
  liquidationPrice?: bigint;
  health?: bigint;
  ltv?: bigint;

  // State
  isLoading: boolean;
  error: string | null;
  isValid: boolean;

  // Actions
  refresh: () => Promise<void>;
}

export interface UsePositionFactoryReturn {
  userPositions: PositionSummary[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  createPosition: (params: CreatePositionParams) => Promise<string>;
  isPending: boolean;
  refetch: () => Promise<void>;
}

export interface UsePositionAddressesReturn {
  positionAddresses: ValidAddress[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// Position state for components
export interface PositionState extends AsyncState<Position> {
  details?: PositionDetails;
  analytics?: PositionAnalytics;
  operations?: PositionOperations;
}

// Position list item for dropdowns
export interface PositionListItem {
  value: string; // position address
  label: string; // position display name
  description?: string; // additional info
  disabled?: boolean;
  position: PositionSummary;
}

// Position history entry
export interface PositionHistoryEntry {
  id: string;
  position: ValidAddress;
  action: 'created' | 'modified' | 'closed' | 'liquidated';
  timestamp: number;
  txHash: string;
  details: {
    collateralChange?: BigIntString;
    leverageChange?: string;
    healthBefore?: BigIntString;
    healthAfter?: BigIntString;
    gasUsed?: BigIntString;
    gasFee?: BigIntString;
  };
}
