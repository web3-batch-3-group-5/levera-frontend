// Fragment for position details
export const POSITION_DETAILS_FRAGMENT = `
  fragment PositionDetails on Position {
    id
    address
    owner
    baseCollateral
    effectiveCollateral
    borrowAmount
    leverage
    liquidationPrice
    health
    ltv
    lastUpdated
  }
`;

// Query for getting positions by owner
export const GET_USER_POSITIONS = `
  ${POSITION_DETAILS_FRAGMENT}
  query GetUserPositions($owner: String!, $first: Int = 10, $skip: Int = 0) {
    positions(
      where: { owner: $owner }
      first: $first
      skip: $skip
      orderBy: lastUpdated
      orderDirection: desc
    ) {
      ...PositionDetails
      lendingPool {
        id
        address
        loanToken {
          symbol
          decimals
        }
        collateralToken {
          symbol
          decimals
        }
      }
    }
  }
`;

// Query for getting positions by lending pool
export const GET_POOL_POSITIONS = `
  ${POSITION_DETAILS_FRAGMENT}
  query GetPoolPositions($poolAddress: String!, $first: Int = 10, $skip: Int = 0) {
    positions(
      where: { lendingPool: $poolAddress }
      first: $first
      skip: $skip
      orderBy: lastUpdated
      orderDirection: desc
    ) {
      ...PositionDetails
      owner
      lendingPool {
        id
        address
        loanToken {
          symbol
          decimals
        }
        collateralToken {
          symbol
          decimals
        }
      }
    }
  }
`;

// Query for getting a specific position
export const GET_POSITION = `
  ${POSITION_DETAILS_FRAGMENT}
  query GetPosition($positionAddress: ID!) {
    position(id: $positionAddress) {
      ...PositionDetails
      owner
      lendingPool {
        id
        address
        loanToken {
          symbol
          decimals
        }
        collateralToken {
          symbol
          decimals
        }
      }
    }
  }
`;
