import { PaginationParams, SortParams, ValidAddress } from './common';
import { UseLendingPoolFactoryReturn, UseLendingPoolReturn } from './pools';
import { UsePositionAddressesReturn, UsePositionFactoryReturn, UsePositionReturn } from './positions';
import { UseTokenMetadataReturn } from './tokens';

/**
 * Hook related type definitions
 */

// Base hook return type
export interface BaseHookReturn {
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch?: () => Promise<void>;
}

// Async hook return type
export interface AsyncHookReturn<T> extends BaseHookReturn {
  data: T | null;
}

// Paginated hook return type
export interface PaginatedHookReturn<T> extends BaseHookReturn {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  loadMore: () => Promise<void>;
  reset: () => void;
}

// Contract hook options
export interface ContractHookOptions {
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
}

// Contract read hook parameters
export interface UseContractReadParams extends ContractHookOptions {
  address: ValidAddress;
  abi: any;
  functionName: string;
  args?: any[];
  account?: ValidAddress;
  chainId?: number;
  blockNumber?: bigint;
  blockTag?: 'latest' | 'earliest' | 'pending' | 'safe' | 'finalized';
}

// Contract write hook parameters
export interface UseContractWriteParams {
  address: ValidAddress;
  abi: any;
  functionName: string;
  account?: ValidAddress;
  chainId?: number;
  gas?: bigint;
  gasPrice?: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  nonce?: number;
  value?: bigint;
}

// Token hooks
export interface UseTokenParams {
  address: ValidAddress;
  options?: ContractHookOptions;
}

export interface UseTokenBalanceParams {
  token: ValidAddress;
  account?: ValidAddress;
  options?: ContractHookOptions;
}

export interface UseTokenAllowanceParams {
  token: ValidAddress;
  owner?: ValidAddress;
  spender: ValidAddress;
  options?: ContractHookOptions;
}

export interface UseTokenPriceParams {
  token: ValidAddress;
  options?: ContractHookOptions;
}

// Pool hooks
export interface UseLendingPoolParams {
  poolAddress: ValidAddress;
  options?: ContractHookOptions;
}

export interface UseLendingPoolFactoryParams {
  options?: ContractHookOptions;
}

export interface UsePoolStatisticsParams {
  poolAddress: ValidAddress;
  options?: ContractHookOptions;
}

export interface UsePoolListParams {
  filters?: {
    positionType?: number;
    loanToken?: ValidAddress;
    collateralToken?: ValidAddress;
    isActive?: boolean;
  };
  pagination?: PaginationParams;
  sorting?: SortParams;
  options?: ContractHookOptions;
}

// Position hooks
export interface UsePositionParams {
  positionAddress: ValidAddress;
  options?: ContractHookOptions;
}

export interface UsePositionFactoryParams {
  options?: ContractHookOptions;
}

export interface UsePositionAddressesParams {
  userAddress?: ValidAddress;
  poolAddress?: ValidAddress;
  options?: ContractHookOptions;
}

export interface UsePositionListParams {
  filters?: {
    owner?: ValidAddress;
    lendingPool?: ValidAddress;
    positionType?: number;
    isActive?: boolean;
  };
  pagination?: PaginationParams;
  sorting?: SortParams;
  options?: ContractHookOptions;
}

// GraphQL hooks
export interface UseGraphQLQueryParams<T = any> {
  query: string;
  variables?: Record<string, any>;
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
    staleTime?: number;
    gcTime?: number;
    suspense?: boolean;
    throwOnError?: boolean;
    select?: (data: any) => T;
  };
}

export interface UseGraphQLMutationParams<T = any> {
  mutation: string;
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    onSettled?: (data: T | undefined, error: Error | null) => void;
  };
}

// Form hooks
export interface UseFormParams<T = any> {
  initialValues?: Partial<T>;
  validationSchema?: any;
  onSubmit: (values: T) => void | Promise<void>;
  onReset?: () => void;
  validate?: (values: T) => Record<string, string>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnMount?: boolean;
}

export interface UseFormReturn<T = any> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldError: (field: keyof T, error: string) => void;
  setFieldTouched: (field: keyof T, touched: boolean) => void;
  resetForm: () => void;
  submitForm: () => Promise<void>;
  validateForm: () => Record<string, string>;
  validateField: (field: keyof T) => string | undefined;
}

// Local storage hooks
export interface UseLocalStorageParams<T> {
  key: string;
  defaultValue: T;
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
}

export interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  removeValue: () => void;
}

// Debounce hooks
export interface UseDebounceParams<T> {
  value: T;
  delay: number;
}

export interface UseDebounceReturn<T> {
  debouncedValue: T;
  isDebouncing: boolean;
}

// Interval hooks
export interface UseIntervalParams {
  callback: () => void;
  delay: number | null;
  immediate?: boolean;
}

// Media query hooks
export interface UseMediaQueryParams {
  query: string;
  defaultValue?: boolean;
}

export interface UseMediaQueryReturn {
  matches: boolean;
  media: string;
}

// Pagination hooks
export interface UsePaginationParams {
  total: number;
  pageSize: number;
  page?: number;
  onChange?: (page: number, pageSize: number) => void;
}

export interface UsePaginationReturn {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: () => void;
  previousPage: () => void;
  goToPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

// Sorting hooks
export interface UseSortingParams<T extends string = string> {
  defaultField?: T;
  defaultDirection?: 'asc' | 'desc';
  onChange?: (field: T, direction: 'asc' | 'desc') => void;
}

export interface UseSortingReturn<T extends string = string> {
  field: T | null;
  direction: 'asc' | 'desc';
  sort: (field: T) => void;
  toggle: (field: T) => void;
  reset: () => void;
}

// Filtering hooks
export interface UseFilteringParams<T = any> {
  defaultFilters?: T;
  onChange?: (filters: T) => void;
}

export interface UseFilteringReturn<T = any> {
  filters: T;
  setFilter: (key: keyof T, value: any) => void;
  setFilters: (filters: T) => void;
  resetFilters: () => void;
  clearFilter: (key: keyof T) => void;
}

// Search hooks
export interface UseSearchParams {
  query?: string;
  delay?: number;
  minLength?: number;
  onChange?: (query: string) => void;
}

export interface UseSearchReturn {
  query: string;
  debouncedQuery: string;
  setQuery: (query: string) => void;
  clearQuery: () => void;
  isSearching: boolean;
}

// Notification hooks
export interface UseNotificationParams {
  duration?: number;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
  maxNotifications?: number;
}

export interface UseNotificationReturn {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

// Theme hooks
export interface UseThemeReturn {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  systemTheme: 'light' | 'dark';
  resolvedTheme: 'light' | 'dark';
}

// Copy to clipboard hooks
export interface UseCopyToClipboardParams {
  timeout?: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface UseCopyToClipboardReturn {
  copy: (text: string) => Promise<void>;
  copied: boolean;
  error: Error | null;
}

// Previous value hooks
export interface UsePreviousReturn<T> {
  previous: T | undefined;
}

// Toggle hooks
export interface UseToggleReturn {
  value: boolean;
  toggle: () => void;
  setTrue: () => void;
  setFalse: () => void;
  setValue: (value: boolean) => void;
}

// Counter hooks
export interface UseCounterParams {
  initialValue?: number;
  min?: number;
  max?: number;
  step?: number;
}

export interface UseCounterReturn {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  set: (value: number) => void;
}

// Re-export commonly used hook types
export type {
  UseLendingPoolFactoryReturn,
  UseLendingPoolReturn,
  UsePositionAddressesReturn,
  UsePositionFactoryReturn,
  UsePositionReturn,
  UseTokenMetadataReturn,
};
