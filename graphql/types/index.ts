export enum PositionType {
    LONG = 0,
    SHORT = 1
}

export interface Token {
    id: string;
    address: string;
    symbol: string;
    decimals: number;
}

export interface Pool {
    id: string;
    address: string;
    loanToken: Token;
    collateralToken: Token;
    totalSupplyAssets: string;
    totalBorrowAssets: string;
    interestRate: string;
    liquidationThresholdPercentage: string;
    positionType: PositionType;
    creator?: string;
    isActive?: boolean;
}

export interface Position {
    id: string;
    address: string;
    owner: string;
    baseCollateral: string;
    effectiveCollateral: string;
    borrowAmount: string;
    leverage: string;
    liquidationPrice: string;
    health: string;
    ltv: string;
    lastUpdated: string;
    lendingPool: Pool;
}

export interface PositionsResponse {
    positions: Position[];
}

export interface PositionResponse {
    position: Position;
}

export interface PoolsResponse {
    pools: Pool[];
}

export type OrderDirection = 'asc' | 'desc';

export type Position_orderBy =
    | 'lastUpdated'
    | 'baseCollateral'
    | 'effectiveCollateral'
    | 'borrowAmount'
    | 'leverage'
    | 'health'
    | 'ltv';

export type Pool_orderBy =
    | 'createdAt'
    | 'totalSupplyAssets'
    | 'totalBorrowAssets'
    | 'interestRate';