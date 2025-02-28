import { NextRequest, NextResponse } from 'next/server';
import { Address } from 'viem';
import { createPublicClient, http } from 'viem';
import { arbitrumSepolia } from 'viem/chains';
import { positionFactoryABI } from '@/lib/abis/positionFactory';
import { CONTRACTS } from '@/config/contracts';

// Initialize Viem client
const client = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL || 'https://sepolia-rollup.arbitrum.io/rpc'),
});

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const poolAddress = searchParams.get('poolAddress') as Address | null;
    const userAddress = searchParams.get('userAddress') as Address | null;

    // Validate required parameters
    if (!poolAddress || !userAddress) {
      return NextResponse.json(
        { error: 'Missing required parameters: poolAddress and userAddress' },
        { status: 400 }
      );
    }

    // Fetch positions from contract
    const positionAddresses = await client.readContract({
      address: CONTRACTS.POSITION_FACTORY.address,
      abi: positionFactoryABI,
      functionName: 'getPoolPositions',
      args: [userAddress, poolAddress],
    }) as Address[];

    // Format response data
    const positions = positionAddresses.map((address, index) => ({
      id: `${poolAddress}-${index}`,
      address,
      lendingPoolAddress: poolAddress,
    }));

    return NextResponse.json(positions);
  } catch (error) {
    console.error('Error fetching positions:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch positions', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}