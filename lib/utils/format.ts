import { formatUnits, Address, erc20Abi, createPublicClient, http } from 'viem';

// Simple public client for Educhain
const publicClient = createPublicClient({
  transport: http('https://rpc.open-campus-codex.gelato.digital/'),
});

// Cache for token decimals to avoid repeated calls
const tokenDecimalsCache = new Map<string, number>();

export function formatTokenAmount(
    amount: bigint | undefined,
    options: {
      tokenAddress?: Address;
      decimals?: number;
      minimumFractionDigits?: number;
      maximumFractionDigits?: number;
    } = {}
): string {
    if (!amount) return '0.00';

    const {
      tokenAddress,
      decimals = 18,
      minimumFractionDigits = 2,
      maximumFractionDigits = 4
    } = options;

    let tokenDecimals = decimals;

    if (tokenAddress) {
      const cachedDecimals = tokenDecimalsCache.get(tokenAddress.toLowerCase());
      if (cachedDecimals !== undefined) {
        tokenDecimals = cachedDecimals;
      } else {
        fetchTokenDecimals(tokenAddress);
      }
    }

    try {
      const formattedAmount = formatUnits(amount, tokenDecimals);
      const numericAmount = parseFloat(formattedAmount);

      return numericAmount.toLocaleString('en-US', {
        minimumFractionDigits,
        maximumFractionDigits
      });
    } catch (error) {
      console.error('Error formatting amount:', error);
      return '0.00';
    }
}

async function fetchTokenDecimals(tokenAddress: Address): Promise<void> {
  if (!tokenAddress) return;
  
  const cacheKey = tokenAddress.toLowerCase();
  
  if (tokenDecimalsCache.has(cacheKey)) return;
  
  try {
    const decimals = await publicClient.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'decimals',
    }) as number;
    
    tokenDecimalsCache.set(cacheKey, decimals);
    console.log(`Cached decimals for ${tokenAddress}: ${decimals}`);
  } catch (error) {
    console.error(`Failed to fetch decimals for ${tokenAddress}:`, error);
  }
}

// Example usage:
// formatTokenAmount(1234567890000000000n) -> "1.23"
// formatTokenAmount(1234567890000000000n, { maximumFractionDigits: 4 }) -> "1.2346"
// formatTokenAmount(1234567890000000000000n, { compact: true }) -> "1.23K"