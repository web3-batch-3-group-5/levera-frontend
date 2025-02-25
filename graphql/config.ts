export const SUBGRAPH_URL = 'https://api.studio.thegraph.com/query/102995/levera-subgraph/version/latest';

export const QUERIES = {
    GET_POSITIONS: `{
        positionCloseds(first: 5) {
            id
            caller
            onBehalf
            collateralAmount
        }
        positionCreateds(first: 5) {
            id
            caller
            onBehalf
            collateralAmount
        }
    }`,

    GET_USER_POSITIONS: `
        query GetUserPositions($user: String!) {
            positionCreateds(where: { onBehalf: $user }) {
                id
                caller
                onBehalf
                collateralAmount
            }
        }
    `,

    GET_POOL_POSITIONS: `
        query GetPoolPositions($poolAddress: String!) {
            positionCreateds(where: { pool: $poolAddress }) {
                id
                caller
                onBehalf
                collateralAmount
            }
        }
    `
};