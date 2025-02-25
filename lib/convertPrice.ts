import { createPublicClient, http } from "viem";
import { sepolia } from "wagmi/chains";
import AggregatorV3InterfaceABI from "@chainlink/contracts/abi/v0.8/AggregatorV3Interface.json";

// Chainlink Price Feeds
const priceFeeds: Record<string, string> = {
  ETH: "0x694AA1769357215DE4FAC081bf1f309aDC325306", // ETH/USD
  BTC: "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43", // BTC/USD
  USDC: "0xAb5c49580294Aff77670F839ea425f5b78ab3Ae7", // USDC/USD
  DAI: "0x0d79df66BE487753B02D015Fb622DED7f0E9798d", // DAI/USD
};

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http("https://eth-sepolia.g.alchemy.com/v2/AGCKLQQJ44DToAoLdZbXDWaT5faaaZGh"),
});

export async function getPrice(token: string): Promise<{ price: number; decimals: number }> {
  if (token === "USD" || token === "USDC") return { price: 1, decimals: 8 };

  const feedAddress = priceFeeds[token];
  if (!feedAddress) throw new Error(`Unsupported token: ${token}`);

  try {
    const data = await publicClient.readContract({
      address: feedAddress as `0x${string}`,
      abi: AggregatorV3InterfaceABI,
      functionName: "latestRoundData",
    }) as [bigint, bigint, bigint, bigint, bigint];

    if (!data || data.length < 5) {
      throw new Error(`Invalid data received from Chainlink for ${token}`);
    }

    const price = Number(data[1]) / 1e8;
    return { price, decimals: 8 };
  } catch (error) {
    throw new Error(`Failed to fetch price for ${token}`);
  }
}
export async function getConversionRate(amountIn: number, tokenIn: string, tokenOut: string): Promise<number> {
  const { price: priceIn, decimals: decimalsIn } = await getPrice(tokenIn);
  const { price: priceOut, decimals: decimalsOut } = await getPrice(tokenOut);

  const amountInNormalized = BigInt(Math.round(amountIn * 10 ** decimalsIn));
  const amountOutNormalized = (amountInNormalized * BigInt(priceIn * 1e8)) / BigInt(priceOut * 1e8);

  return Number(amountOutNormalized) / 10 ** decimalsOut;
}
