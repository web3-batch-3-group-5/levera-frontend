import { Address } from 'viem';

/**
 * Common utility types used throughout the application
 */

// Base entity interface
export interface BaseEntity {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Sorting types
export type SortDirection = 'asc' | 'desc';

export interface SortParams<T extends string = string> {
  field: T;
  direction: SortDirection;
}

// Loading states
export interface LoadingState {
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
}

export interface AsyncState<T> extends LoadingState {
  data: T | null;
}

// Contract interaction types
export interface ContractError {
  code: string;
  message: string;
  details?: string;
  txHash?: string;
}

export interface TransactionState {
  isPending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  txHash?: string;
  error?: ContractError;
}

// Form types
export interface FormField<T = any> {
  value: T;
  error?: string;
  touched: boolean;
  dirty: boolean;
}

export interface FormState<T extends Record<string, any>> {
  fields: { [K in keyof T]: FormField<T[K]> };
  isValid: boolean;
  isSubmitting: boolean;
  errors: Partial<{ [K in keyof T]: string }>;
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type Nullable<T> = T | null;
export type Maybe<T> = T | undefined;

// Address validation
export type ValidAddress = Address;
export type AddressString = string;

// Numeric types for financial calculations
export type BigIntString = string;
export type PercentageString = string;
export type DecimalString = string;

// Status enums
export enum Status {
  PENDING = 'pending',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

// Theme types
export type Theme = 'light' | 'dark' | 'system';

// Notification types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  timestamp: number;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

// Health factor thresholds (moved from hardcoded values)
export const HEALTH_THRESHOLDS = {
  CRITICAL: 1.1,
  WARNING: 1.3,
  HEALTHY: 2.0,
} as const;

export type HealthStatus = 'critical' | 'warning' | 'healthy' | 'unknown';

// Leverage constants
export const LEVERAGE_LIMITS = {
  MIN: 1,
  MAX: 10,
  DEFAULT: 2,
} as const;

// Time constants
export const TIME_CONSTANTS = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
} as const;
