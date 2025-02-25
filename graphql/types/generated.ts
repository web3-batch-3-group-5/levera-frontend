export interface LendingPool {
    id: string;
    loanToken: Token;
    collateralToken: Token;
    totalSupplyAssets: string;
    totalSupplyShares: string;
    totalBorrowAssets: string;
    totalBorrowShares: string;
    borrowRate: string;
    positions: Position[];
    createdAt: string;
    updatedAt: string;
}

export interface Position {
    id: string;
    user: string;
    pool: LendingPool;
    collateralAmount: string;
    borrowedAmount: string;
    healthFactor: string;
    liquidationPrice: string;
    leverage: string;
    createdAt: string;
    updatedAt: string;
}

export interface Token {
    id: string;
    symbol: string;
    name: string;
    decimals: number;
}

export interface UserPosition {
    id: string;
    positions: Position[];
}