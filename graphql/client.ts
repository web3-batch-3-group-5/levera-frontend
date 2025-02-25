import { request } from 'graphql-request';

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'https://thegraph.com/studio/subgraph/levera-subgraph/endpoints';

interface QueryVariables {
    [key: string]: unknown;
}

export async function queryGraph<T>(
    query: string,
    variables: QueryVariables = {}
): Promise<T> {
    try {
        return await request(GRAPHQL_URL, query, variables);
    } catch (error: any) {
        console.error('GraphQL query failed:', {
            query,
            variables,
            error: error.message,
            details: error.response?.errors
        });

        throw new Error(
            `Failed to query data: ${error.response?.errors?.[0]?.message || error.message}`
        );
    }
}

export const CACHE_TIME = {
    STANDARD: 30_000,  // 30 seconds
    EXTENDED: 60_000,  // 1 minute
    LONG: 300_000,     // 5 minutes
};