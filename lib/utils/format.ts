import { formatUnits, Address, erc20Abi, createPublicClient, http } from 'viem';
import { LRUCache as LRU } from 'lru-cache';
import { eduChainTestnet, arbitrumSepolia } from '@/lib/chains';

// Helper to get chain configuration
const getChainConfig = (chainId: number) => {
  switch (chainId) {
    case eduChainTestnet.id:
      return eduChainTestnet;
    case arbitrumSepolia.id:
      return arbitrumSepolia;
    default:
      throw new Error('Unsupported chain');
  }
};

// 1. Dynamic Client Management
const clientCache = new Map<number, ReturnType<typeof createPublicClient>>();
const RPC_OPTIONS = {
  timeout: 10_000,
  retryCount: 3,
  batch: { wait: 100 },
};

const getPublicClient = (chainId: number) => {
  if (clientCache.has(chainId)) {
    return clientCache.get(chainId)!;
  }

  const chain = getChainConfig(chainId);
  const client = createPublicClient({
    chain,
    transport: http(chain.rpcUrls.default.http[0], RPC_OPTIONS),
  });

  clientCache.set(chainId, client);
  return client;
};

// 2. Enhanced Rate Limiter
const rateLimiter = new LRU<number, number>({
  max: 1000,
  ttl: 60_000,
});

const checkRateLimit = (chainId: number) => {
  const count = rateLimiter.get(chainId) || 0;
  if (count >= 100) {
    throw new Error(`Chain ${chainId} rate limit exceeded (100 req/min)`);
  }
  rateLimiter.set(chainId, count + 1);
};

// 3. Token Cache with Chain Awareness
const tokenDecimalsCache = new LRU<string, number>({
  max: 1000,
  ttl: 3600_000, // 1 hour
});

async function fetchTokenDecimals(tokenAddress: Address, chainId: number): Promise<number> {
  const cacheKey = `${chainId}:${tokenAddress.toLowerCase()}`;

  if (tokenDecimalsCache.has(cacheKey)) {
    return tokenDecimalsCache.get(cacheKey)!;
  }

  checkRateLimit(chainId);
  const client = getPublicClient(chainId);

  try {
    const decimals = await client.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'decimals',
    });

    tokenDecimalsCache.set(cacheKey, Number(decimals));
    return Number(decimals);
  } catch (error) {
    console.error(`Failed to fetch decimals for ${tokenAddress}:`, error);
    return 18; // Fallback to default
  }
}

// 4. Enhanced Formatting Function
export function formatTokenAmount(
  amount: bigint | undefined,
  options: {
    chainId?: number;
    tokenAddress?: Address;
    decimals?: number;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {},
): string {
  if (!amount) return '0.00';

  const {
    chainId,
    tokenAddress,
    decimals: manualDecimals,
    minimumFractionDigits = 2,
    maximumFractionDigits = 4,
  } = options;

  let finalDecimals = manualDecimals ?? 18;

  if (tokenAddress) {
    if (!chainId) throw new Error('Chain ID required when using tokenAddress');

    const cacheKey = `${chainId}:${tokenAddress.toLowerCase()}`;
    const cached = tokenDecimalsCache.get(cacheKey);

    if (cached !== undefined) {
      finalDecimals = cached;
    } else {
      fetchTokenDecimals(tokenAddress, chainId)
        .then(decimals => {
          finalDecimals = decimals;
          tokenDecimalsCache.set(cacheKey, decimals);
        })
        .catch(console.error);
    }
  }

  try {
    const formatted = formatUnits(amount, finalDecimals);
    const numeric = parseFloat(formatted);

    return numeric.toLocaleString('en-US', {
      minimumFractionDigits,
      maximumFractionDigits,
      useGrouping: true,
    });
  } catch (error) {
    console.error('Formatting error:', error);
    return '0.00';
  }
}

// Example usage:
// formatTokenAmount(1234567890000000000n, {
//   chainId: eduChainTestnet.id,
//   tokenAddress: '0x...'
// });
