# Levera Frontend Type System

This directory contains comprehensive TypeScript type definitions for the Levera Frontend application. The types are organized into logical modules to ensure maintainability and reusability across the codebase.

## 📁 File Structure

```
types/
├── index.ts          # Central export file
├── common.ts         # Common utility types and constants
├── tokens.ts         # Token-related types
├── pools.ts          # Lending pool types
├── positions.ts      # Position types
├── contracts.ts      # Contract interaction types
├── ui.ts            # UI component types
├── hooks.ts         # Hook types
├── graphql.ts       # GraphQL types
└── README.md        # This file
```

## 🚀 Usage

### Import Types

```typescript
// Import all types
import * as Types from '@/types';

// Import specific modules
import { Token, TokenBalance } from '@/types/tokens';
import { LendingPool, PositionType } from '@/types/pools';
import { Position, PositionDetails } from '@/types/positions';
import { ButtonProps, CardProps } from '@/types/ui';
import { HEALTH_THRESHOLDS } from '@/types/common';
```

### Common Patterns

#### Using Base Types

```typescript
import { ValidAddress, AsyncState } from '@/types/common';

const userAddress: ValidAddress = '0x123...';
const poolState: AsyncState<LendingPool> = {
  data: null,
  isLoading: true,
  isError: false,
  error: null,
};
```

#### Using Constants

```typescript
import { HEALTH_THRESHOLDS, LEVERAGE_LIMITS } from '@/types/common';

// Use predefined constants instead of magic numbers
const isHealthy = healthFactor > HEALTH_THRESHOLDS.WARNING;
const maxLeverage = LEVERAGE_LIMITS.MAX;
```

#### Component Props

```typescript
import { ButtonProps, CardProps } from '@/types/ui';

const MyButton: React.FC<ButtonProps> = ({ variant = 'default', size = 'default', children, ...props }) => {
  // Component implementation
};
```

#### Hook Return Types

```typescript
import { UsePositionReturn } from '@/types/hooks';

export function usePosition(address: ValidAddress): UsePositionReturn {
  // Hook implementation
}
```

## 📋 Type Categories

### 1. Common Types (`common.ts`)

- **Base interfaces**: `BaseEntity`, `LoadingState`, `AsyncState`
- **Utility types**: `Optional`, `RequiredFields`, `Nullable`
- **Constants**: `HEALTH_THRESHOLDS`, `LEVERAGE_LIMITS`
- **Enums**: `Status`, `Theme`

### 2. Token Types (`tokens.ts`)

- **Core**: `Token`, `TokenMetadata`, `TokenBalance`
- **Operations**: `TokenAllowance`, `TokenApprovalRequest`
- **UI**: `TokenListItem`, `TokenValidationResult`
- **Hooks**: `UseTokenReturn`, `UseTokenMetadataReturn`

### 3. Pool Types (`pools.ts`)

- **Core**: `LendingPool`, `PoolDetails`, `PoolStatistics`
- **Operations**: `CreateLendingPoolParams`, `PoolOperations`
- **UI**: `PoolCardData`, `PoolListItem`
- **Hooks**: `UseLendingPoolReturn`, `UseLendingPoolFactoryReturn`

### 4. Position Types (`positions.ts`)

- **Core**: `Position`, `PositionDetails`, `PositionSummary`
- **Operations**: `CreatePositionParams`, `ModifyPositionParams`
- **Analytics**: `PositionAnalytics`, `PositionHistoryEntry`
- **Hooks**: `UsePositionReturn`, `UsePositionFactoryReturn`

### 5. Contract Types (`contracts.ts`)

- **Configuration**: `ContractConfig`, `ContractAddresses`
- **Operations**: `ContractCallParams`, `ContractReadResult`
- **Interfaces**: `LendingPoolContract`, `PositionContract`
- **Hooks**: `UseContractReadReturn`, `UseContractWriteReturn`

### 6. UI Types (`ui.ts`)

- **Components**: `ButtonProps`, `InputProps`, `ModalProps`
- **Layout**: `LayoutProps`, `NavigationProps`
- **Theme**: `ThemeProviderProps`, `ColorPalette`
- **Accessibility**: `AccessibilityProps`

### 7. Hook Types (`hooks.ts`)

- **Base**: `BaseHookReturn`, `AsyncHookReturn`
- **Specific**: Re-exports from other modules
- **Utilities**: `UseFormReturn`, `UsePaginationReturn`

### 8. GraphQL Types (`graphql.ts`)

- **Entities**: `GraphQLPool`, `GraphQLPosition`, `GraphQLUser`
- **Responses**: `PoolsResponse`, `PositionsResponse`
- **Queries**: `PoolsQueryParams`, `PositionsQueryParams`
- **Subscriptions**: `PoolSubscription`, `PositionSubscription`

## 🔧 Best Practices

### 1. Type Safety

- Always use `ValidAddress` for Ethereum addresses
- Use `BigIntString` for large numeric values from contracts
- Use `PercentageString` for percentage values

### 2. Naming Conventions

- Use PascalCase for interfaces and types
- Use UPPER_SNAKE_CASE for constants
- Use descriptive names that indicate purpose

### 3. Documentation

- Add JSDoc comments for complex types
- Include examples in comments where helpful
- Document any breaking changes

### 4. Deprecation

- Mark deprecated types with `@deprecated` JSDoc tag
- Provide migration path in deprecation comments
- Remove deprecated types after appropriate notice period

## 🔄 Migration Guide

### From Legacy Types

#### Old Pattern

```typescript
// Old scattered type definitions
interface TokenData {
  address: string;
  symbol: string;
  decimals: number;
}

interface PoolData {
  // Various inconsistent definitions
}
```

#### New Pattern

```typescript
// New centralized types
import { Token, LendingPool } from '@/types';

const token: Token = {
  id: '1',
  address: '0x123...',
  symbol: 'USDC',
  decimals: 6,
  name: 'USD Coin',
  logoUrl: '/tokens/usdc.png',
  isActive: true,
  createdAt: '2023-01-01T00:00:00Z',
};
```

### Update Import Statements

```typescript
// Before
import { PoolDetails } from '@/config/contracts';
import { Position } from '@/lib/types/position';

// After
import { PoolDetails } from '@/types/pools';
import { Position } from '@/types/positions';
```

## 📈 Future Enhancements

1. **Runtime Validation**: Add runtime type checking with libraries like `zod`
2. **Code Generation**: Generate types from GraphQL schema
3. **API Types**: Add types for REST API endpoints
4. **Testing Types**: Add types for test utilities and mocks
5. **Documentation**: Generate API documentation from types

## 🤝 Contributing

When adding new types:

1. Place them in the appropriate module
2. Export them from the module's index
3. Add JSDoc documentation
4. Update this README if needed
5. Add examples in comments

## 📚 Related Documentation

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React TypeScript Patterns](https://react-typescript-cheatsheet.netlify.app/)
- [Viem Types](https://viem.sh/docs/typescript.html)
- [Wagmi Types](https://wagmi.sh/react/typescript)
