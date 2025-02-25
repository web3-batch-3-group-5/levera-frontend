export interface Position {
    id: string;
    user: string;
    collateralAmount: string;
    borrowedAmount: string;
    healthFactor: string;
    liquidationPrice: string;
    leverage: string;
    createdAt: string;
    pool: {
        id: string;
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

export interface PositionsResponse {
    positions: Position[];
}

export interface PositionResponse {
    position: Position;
}

export type OrderDirection = 'asc' | 'desc';

export type Position_orderBy =
    | 'createdAt'
    | 'collateralAmount'
    | 'borrowedAmount'
    | 'healthFactor'
    | 'leverage';