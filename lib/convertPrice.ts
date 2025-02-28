import BigNumber from "bignumber.js";
import { createPublicClient, http } from "viem";
import { sepolia } from "wagmi/chains";
import AggregatorV3InterfaceABI from "@chainlink/contracts/abi/v0.8/AggregatorV3Interface.json";

// const publicClient = createPublicClient({
//   chain: sepolia,
//   transport: http("https://eth-sepolia.g.alchemy.com/v2/AGCKLQQJ44DToAoLdZbXDWaT5faaaZGh"),
// });

// temporary price converter
const priceConverter: { [key: string]: number } = {
  'laUSDC': 1,
  'laUSDT': 1,
  'laDAI': 1,
  'laETH': 2500,
  'laWBTC': 100_000,
};

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(process.env.VITE_ALCHEMY_RPC_URL),
});

export function convertPrice(tokenSymbolIn: string, tokenSymbolOut: string, amount: number): number {
  return priceConverter[tokenSymbolOut] * amount / priceConverter[tokenSymbolIn];
}

export async function getPrice(token: string): Promise<{ price: BigNumber; decimals: number }> {
  if (token === "USD" || token === "USDC") return { price: new BigNumber(1), decimals: 8 };
  try {
    const data = await publicClient.readContract({
      address: token as `0x${string}`,
      abi: AggregatorV3InterfaceABI,
      functionName: "latestRoundData",
    }) as [bigint, bigint, bigint, bigint, bigint];

    if (!data || data.length < 5) {
      throw new Error(`Invalid data received from Chainlink for ${token}`);
    }

    const price = new BigNumber(data[1].toString()).dividedBy(1e8);
    return { price, decimals: 8 };
  } catch (error) {
    throw new Error(`Failed to fetch price for ${token} due to ${(error as any)?.message}`);
  }
}

export async function getConversionRate(amountIn: number, tokenIn: string, tokenOut: string): Promise<number> {
  const { price: priceIn, decimals: decimalsIn } = await getPrice(tokenIn);
  const { price: priceOut, decimals: decimalsOut } = await getPrice(tokenOut);

  const amountInNormalized = new BigNumber(amountIn).times(new BigNumber(10).pow(decimalsIn));
  const amountOutNormalized = amountInNormalized.times(priceIn).div(priceOut);

  return amountOutNormalized.div(new BigNumber(10).pow(decimalsOut)).toNumber();
}
