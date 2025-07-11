import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';

// Initialize Viem client for Educhain
const client = createPublicClient({
  transport: http('https://rpc.open-campus-codex.gelato.digital/'),
});

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { address, abi, functionName, args = [] } = body;

    // Validate required parameters
    if (!address || !abi || !functionName) {
      return NextResponse.json(
        { error: 'Missing required parameters: address, abi, or functionName' },
        { status: 400 },
      );
    }

    // Read from the contract
    const result = await client.readContract({
      address,
      abi,
      functionName,
      args,
    });

    // Return the result
    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error reading contract:', error);

    return NextResponse.json(
      { error: 'Failed to read contract', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
