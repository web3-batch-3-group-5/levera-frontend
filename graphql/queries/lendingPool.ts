export const GET_LENDING_POOLS = `
  query GetLendingPools($first: Int, $skip: Int) {
    allLendingPools(first: $first, skip: $skip) {
      id
      lendingPool
      loanToken
      collateralToken
      blockTimestamp
    }
  }
`;

export const GET_LENDING_POOL = `
  query GetLendingPoolStat($poolId: ID!) {
    lendingPoolStats(id: $poolId) {
      id
      lendingPool
      loanToken
      collateralToken
      totalSupplyAssets
      totalSupplyShares
      totalBorrowAssets
      totalBorrowShares
      totalCollateral
      utilizationRate
      blockTimestamp
    }
  }
`;

export const GET_USER_POSITIONS = `
  query GetUserPositions($lendingPool: Bytes!, $userId: Bytes!) {
    userPositions(where: { lendingPool: $lendingPool, caller: $userId }) {
      id
      lendingPool,
      caller,
      onBehalf,
      baseCollateral,
      effectiveCollateral,
      borrowShares,
      leverage,
      liquidationPrice,
      health,
      ltv
    }
  }
`;

export const GET_USER_POSITION = `
  query GetUserPosition($positionId: ID!) {
    userPosition(id: $positionId) {
      id
      lendingPool,
      caller,
      onBehalf,
      baseCollateral,
      effectiveCollateral,
      borrowShares,
      leverage,
      liquidationPrice,
      health,
      ltv
    }
  }
`;