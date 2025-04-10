import { NextRequest, NextResponse } from 'next/server';
import { Address, createPublicClient, http } from 'viem';
import { eduChainTestnet, arbitrumSepolia } from '@/lib/chains';
import { positionFactoryABI } from '@/lib/abis/positionFactory';
import { CONTRACTS } from '@/config/contracts';
import { LRUCache as LRU } from 'lru-cache';

type CachedRateLimit = {
  id: string;
  address: `0x${string}`;
  lendingPoolAddress: `0x${string}`;
}

// Configure rateLimiter cache (15s TTL, max 100 entries)
const rateLimiter = new LRU<string, CachedRateLimit[]>({
  max: 100,
  ttl: 15_000,
});

// Add request queue for concurrency control
const requestQueue = new Map<string, Promise<NextResponse<CachedRateLimit[]>>>();

// Helper to get chain configuration
const getChainConfig = (chainId: number) => {
  switch (chainId) {
    case eduChainTestnet.id: return eduChainTestnet;
    case arbitrumSepolia.id: return arbitrumSepolia;
    default: throw new Error('Unsupported chain');
  }
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const chainId = Number(searchParams.get('chainId'));
    const poolAddress = searchParams.get('poolAddress') as Address | null;
    const userAddress = searchParams.get('userAddress') as Address | null;

    // Validate parameters
    if (!chainId || !poolAddress || !userAddress) {
      return NextResponse.json(
        { error: 'Missing required parameters: chainId, poolAddress, userAddress' },
        { status: 400 }
      );
    }

    // Create cache key
    const cacheKey = `${chainId}-${poolAddress}-${userAddress}`;
    
    // Check cache first
    const cached = rateLimiter.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Deduplicate concurrent requests
    if (requestQueue.has(cacheKey)) {
      return await requestQueue.get(cacheKey)!;
    }

    // Get chain configuration dynamically
    const chain = getChainConfig(chainId);

    const requestPromise = (async () => {
      try {
        // Add rate limiting headers
        const rateLimit = {
          remaining: 100,
          limit: 100,
          reset: Date.now() + 60_000
        };

        // Create client with timeout
        const client = createPublicClient({
          chain,
          transport: http(chain.rpcUrls.default.http[0], {
            timeout: 10_000,
            retryCount: 2
          }),
        });

        // Fetch positions
        const positionAddresses = await client.readContract({
          address: CONTRACTS.POSITION_FACTORY.address,
          abi: positionFactoryABI,
          functionName: 'getPoolPositions',
          args: [userAddress, poolAddress],
        }) as Address[];

        // Cache successful responses
        const responseData = positionAddresses.map((address, index) => ({
          id: `${poolAddress}-${index}`,
          address,
          lendingPoolAddress: poolAddress,
        }));
        rateLimiter.set(cacheKey, responseData);
        
        return NextResponse.json(responseData, {
          headers: {
            'X-RateLimit-Limit': `${rateLimit.limit}`,
            'X-RateLimit-Remaining': `${rateLimit.remaining}`,
            'X-RateLimit-Reset': `${rateLimit.reset}`
          }
        });
      } finally {
        requestQueue.delete(cacheKey);
      }
    })();

    requestQueue.set(cacheKey, requestPromise);
    return await requestPromise;
  } catch (error) {
    console.error('Error fetching positions:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch positions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: error instanceof Error && error.message.includes('Unsupported') ? 400 : 500 }
    );
  }
}
