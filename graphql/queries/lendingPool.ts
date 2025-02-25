export const GET_LENDING_POOL = `
  query GetLendingPool($poolId: ID!) {
    lendingPool(id: $poolId) {
      id
      loanToken {
        id
        symbol
        name
        decimals
      }
      collateralToken {
        id
        symbol
        name
        decimals
      }
      totalSupplyAssets
      totalSupplyShares
      totalBorrowAssets
      totalBorrowShares
      borrowRate
      createdAt
      updatedAt
    }
  }
`;

export const GET_USER_POSITIONS = `
  query GetUserPositions($userId: String!) {
    positions(where: { user: $userId }) {
      id
      user
      pool {
        id
        loanToken {
          symbol
        }
        collateralToken {
          symbol
        }
      }
      collateralAmount
      borrowedAmount
      healthFactor
      liquidationPrice
      leverage
      createdAt
      updatedAt
    }
  }
`;

export const GET_POOL_POSITIONS = `
  query GetPoolPositions($poolId: ID!) {
    positions(where: { pool: $poolId }) {
      id
      user
      collateralAmount
      borrowedAmount
      healthFactor
      liquidationPrice
      leverage
      createdAt
      updatedAt
    }
  }
`;