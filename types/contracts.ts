import { Abi } from 'viem';
import { ContractError, ValidAddress } from './common';
import { CreateLendingPoolParams } from './pools';
import { CreatePositionParams } from './positions';

/**
 * Contract related type definitions
 */

// Contract configuration
export interface ContractConfig {
  address: ValidAddress;
  abi: Abi;
  name?: string;
  version?: string;
  deployedAt?: number;
}

// Contract addresses
export interface ContractAddresses {
  LENDING_POOL_FACTORY: ValidAddress;
  POSITION_FACTORY: ValidAddress;
  LENDING_POOL: ValidAddress; // Template
  POSITION: ValidAddress; // Template
  TOKEN_ADDRESSES: ValidAddress[];
}

// Contract function call parameters
export interface ContractCallParams {
  address: ValidAddress;
  abi: Abi;
  functionName: string;
  args?: any[];
  value?: bigint;
}

// Contract read result
export interface ContractReadResult<T = any> {
  result: T;
  status: 'success' | 'failure';
  error?: string;
}

// Contract write result
export interface ContractWriteResult {
  hash: string;
  wait: () => Promise<ContractTransactionReceipt>;
}

// Contract transaction receipt
export interface ContractTransactionReceipt {
  blockHash: string;
  blockNumber: bigint;
  transactionHash: string;
  transactionIndex: number;
  from: ValidAddress;
  to: ValidAddress;
  gasUsed: bigint;
  effectiveGasPrice: bigint;
  status: 'success' | 'reverted';
  logs: ContractLog[];
}

// Contract event log
export interface ContractLog {
  address: ValidAddress;
  topics: string[];
  data: string;
  blockNumber: bigint;
  transactionHash: string;
  logIndex: number;
}

// Contract event types
export interface ContractEvent {
  eventName: string;
  args: Record<string, any>;
  address: ValidAddress;
  blockNumber: bigint;
  transactionHash: string;
  logIndex: number;
}

// Lending Pool Factory contract calls
export interface LendingPoolFactoryContract {
  createLendingPool: (params: CreateLendingPoolParams) => Promise<ContractWriteResult>;
  getAllLendingPools: () => Promise<ValidAddress[]>;
  getLendingPoolsLength: () => Promise<number>;
  getLendingPoolByIndex: (index: number) => Promise<ValidAddress>;
  isLendingPoolExists: (poolAddress: ValidAddress) => Promise<boolean>;
}

// Position Factory contract calls
export interface PositionFactoryContract {
  createPosition: (params: CreatePositionParams) => Promise<ContractWriteResult>;
  getUserPositions: (user: ValidAddress) => Promise<ValidAddress[]>;
  getUserPositionsLength: (user: ValidAddress) => Promise<number>;
  getAllPositions: () => Promise<ValidAddress[]>;
  getPositionsLength: () => Promise<number>;
  isPositionExists: (positionAddress: ValidAddress) => Promise<boolean>;
}

// Lending Pool contract calls
export interface LendingPoolContract {
  // View functions
  totalSupplyAssets: () => Promise<bigint>;
  totalSupplyShares: () => Promise<bigint>;
  totalBorrowAssets: () => Promise<bigint>;
  totalBorrowShares: () => Promise<bigint>;
  interestRate: () => Promise<bigint>;
  ltp: () => Promise<bigint>;
  userSupplyShares: (user: ValidAddress) => Promise<bigint>;

  // State-changing functions
  supply: (amount: bigint) => Promise<ContractWriteResult>;
  withdraw: (shares: bigint) => Promise<ContractWriteResult>;
  borrow: (amount: bigint) => Promise<ContractWriteResult>;
  repay: (amount: bigint) => Promise<ContractWriteResult>;
}

// Position contract calls
export interface PositionContract {
  // View functions
  baseCollateral: () => Promise<bigint>;
  effectiveCollateral: () => Promise<bigint>;
  borrowShares: () => Promise<bigint>;
  leverage: () => Promise<bigint>;
  liquidationPrice: () => Promise<bigint>;
  health: () => Promise<bigint>;
  ltv: () => Promise<bigint>;
  owner: () => Promise<ValidAddress>;
  lendingPool: () => Promise<ValidAddress>;

  // State-changing functions
  addCollateral: (amount: bigint) => Promise<ContractWriteResult>;
  removeCollateral: (amount: bigint) => Promise<ContractWriteResult>;
  adjustLeverage: (newLeverage: bigint) => Promise<ContractWriteResult>;
  close: () => Promise<ContractWriteResult>;
}

// ERC20 contract calls
export interface ERC20Contract {
  // View functions
  name: () => Promise<string>;
  symbol: () => Promise<string>;
  decimals: () => Promise<number>;
  totalSupply: () => Promise<bigint>;
  balanceOf: (account: ValidAddress) => Promise<bigint>;
  allowance: (owner: ValidAddress, spender: ValidAddress) => Promise<bigint>;

  // State-changing functions
  transfer: (to: ValidAddress, amount: bigint) => Promise<ContractWriteResult>;
  approve: (spender: ValidAddress, amount: bigint) => Promise<ContractWriteResult>;
  transferFrom: (from: ValidAddress, to: ValidAddress, amount: bigint) => Promise<ContractWriteResult>;
}

// Contract interaction hooks
export interface UseContractReadReturn<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export interface UseContractWriteReturn {
  writeContract: (args: ContractCallParams) => Promise<string>;
  isPending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  error: ContractError | null;
  reset: () => void;
}

// Contract event subscription
export interface ContractEventSubscription {
  eventName: string;
  contract: ValidAddress;
  callback: (event: ContractEvent) => void;
  filter?: Record<string, any>;
}

// Contract gas estimation
export interface GasEstimation {
  gasLimit: bigint;
  gasPrice: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  totalCost: bigint;
}

// Contract deployment parameters
export interface ContractDeploymentParams {
  bytecode: string;
  abi: Abi;
  constructorArgs?: any[];
  gasLimit?: bigint;
  gasPrice?: bigint;
  value?: bigint;
}

// Contract upgrade parameters
export interface ContractUpgradeParams {
  proxyAddress: ValidAddress;
  newImplementation: ValidAddress;
  upgradeData?: string;
}

// Contract verification parameters
export interface ContractVerificationParams {
  address: ValidAddress;
  sourceCode: string;
  contractName: string;
  compilerVersion: string;
  optimizationUsed: boolean;
  runs?: number;
  constructorArgs?: string;
}

// Multi-call parameters
export interface MultiCallParams {
  calls: ContractCallParams[];
  allowFailure?: boolean;
}

// Multi-call result
export interface MultiCallResult {
  success: boolean;
  returnData: string;
  result?: any;
  error?: string;
}

// Contract state monitoring
export interface ContractStateMonitor {
  contract: ValidAddress;
  functions: string[];
  interval: number;
  callback: (state: Record<string, any>) => void;
}

// Contract interaction options
export interface ContractInteractionOptions {
  gasLimit?: bigint;
  gasPrice?: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  value?: bigint;
  nonce?: number;
  from?: ValidAddress;
  timeout?: number;
  confirmations?: number;
}
