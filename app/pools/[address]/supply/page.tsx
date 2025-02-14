'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Address, parseUnits, formatUnits, zeroAddress, Hash } from 'viem';
import { useLendingPool } from '@/hooks/useLendingPool';
import { useLendingPoolFactory } from '@/hooks/useLendingPoolFactory';
import { useAccount, useConfig } from 'wagmi';
import { getPublicClient } from '@wagmi/core';
import { Button } from '@/components/shared/Button';
import { ArrowLeft } from 'lucide-react';
import { formatAddress } from '@/lib/utils';
import { useReadContract, useWriteContract } from 'wagmi';
import { erc20Abi } from 'viem';
import { toast } from 'sonner';

// Helper function to format token amounts
const formatTokenAmount = (amount: bigint | undefined, decimals: number = 18) => {
    if (!amount) return '0.00';
    return Number(formatUnits(amount, decimals)).toLocaleString(undefined, {
        maximumFractionDigits: 6,
        minimumFractionDigits: 2
    });
};

export default function SupplyPage() {
    const params = useParams();
    const router = useRouter();
    const config = useConfig();
    const { address: userAddress } = useAccount();
    const poolAddress = params.address as Address;

    const [amount, setAmount] = useState('');
    const [needsApproval, setNeedsApproval] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [isSupplying, setIsSupplying] = useState(false);
    const [supplyAmount, setSupplyAmount] = useState<bigint>(0n);

    // Get pool details
    const { poolAddresses, pools } = useLendingPoolFactory();
    const poolIndex = poolAddresses.findIndex(addr => addr.toLowerCase() === poolAddress.toLowerCase());
    const pool = poolIndex !== -1 ? pools[poolIndex] : undefined;

    // Get pool stats and supply function
    const {
        totalSupplyAssets,
        totalSupplyShares,
        supply,
    } = useLendingPool(poolAddress);

    // Check token balance
    const { data: tokenBalance } = useReadContract({
        address: pool?.loanToken,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [userAddress || zeroAddress],
    });

    // Check token allowance
    const { data: currentAllowance } = useReadContract({
        address: pool?.loanToken,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [userAddress || zeroAddress, poolAddress],
    });

    // Setup write contract
    const { writeContract } = useWriteContract();

    const handleApprove = async () => {
        if (!pool || !supplyAmount) return;

        try {
            setIsApproving(true);

            const hash = await writeContract({
                address: pool.loanToken,
                abi: erc20Abi,
                functionName: 'approve',
                args: [poolAddress, supplyAmount],
            });

            if (hash) {
                toast.loading('Approving token...');
                const publicClient = getPublicClient(config);

                if (publicClient) {
                    await publicClient.waitForTransactionReceipt({
                        hash: hash as Hash,
                    });
                    toast.success('Token approved successfully!');
                    setNeedsApproval(false);
                }
            }
        } catch (error) {
            console.error('Error approving token:', error);
            toast.error('Failed to approve token');
        } finally {
            setIsApproving(false);
        }
    };

    const handleSupply = async () => {
        if (!supplyAmount || !pool) return;

        try {
            setIsSupplying(true);

            const result = await supply(supplyAmount);

            if (result) {
                toast.loading('Supplying tokens...');
                const publicClient = getPublicClient(config);

                if (publicClient) {
                    const hash = result as Hash;
                    const receipt = await publicClient.waitForTransactionReceipt({
                        hash
                    });

                    if (receipt.status === 'success') {
                        toast.success(`Successfully supplied ${formatTokenAmount(supplyAmount)} ${pool.loanTokenSymbol}!`);
                        router.push(`/pools/${poolAddress}`);
                    } else {
                        throw new Error('Transaction failed');
                    }
                }
            }
        } catch (error) {
            console.error('Error supplying tokens:', error);
            toast.error('Failed to supply tokens');
        } finally {
            setIsSupplying(false);
        }
    };

    // Check if approval is needed whenever amount changes
    useEffect(() => {
        if (!amount || !currentAllowance || !pool) return;

        try {
            const parsedAmount = parseUnits(amount, 18);
            setSupplyAmount(parsedAmount);
            setNeedsApproval(currentAllowance < parsedAmount);
        } catch (error) {
            console.error('Error checking allowance:', error);
        }
    }, [amount, currentAllowance, pool]);

    if (!pool) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Pool not found</h1>
                    <Button onClick={() => router.back()}>
                        <ArrowLeft className="size-4 mr-2" />
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    const availableBalance = tokenBalance ? formatTokenAmount(tokenBalance) : '0.00';

    return (
        <main className="container mx-auto px-4 py-8">
            <Button
                variant="ghost"
                className="mb-6"
                onClick={() => router.back()}
            >
                <ArrowLeft className="size-4 mr-2" />
                Back to Pool
            </Button>

            <div className="max-w-xl mx-auto">
                <div className="bg-card rounded-lg border p-6 space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">
                            Supply {pool.loanTokenSymbol}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Supply {pool.loanTokenSymbol} to earn interest
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Amount to Supply
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full px-4 py-2 bg-background border rounded-md"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    <button
                                        onClick={() => tokenBalance && setAmount(formatUnits(tokenBalance, 18))}
                                        className="text-xs text-primary hover:underline"
                                    >
                                        MAX
                                    </button>
                                    <span className="text-sm text-muted-foreground">
                    {pool.loanTokenSymbol}
                  </span>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                                Available: {availableBalance} {pool.loanTokenSymbol}
                            </p>
                        </div>

                        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Pool Address</span>
                                <span className="font-mono">{formatAddress(poolAddress)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Total Supply</span>
                                <span>{formatTokenAmount(totalSupplyAssets)} {pool.loanTokenSymbol}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Your Supply Shares</span>
                                <span>{formatTokenAmount(totalSupplyShares)}</span>
                            </div>
                        </div>

                        {needsApproval ? (
                            <Button
                                className="w-full"
                                size="lg"
                                onClick={handleApprove}
                                disabled={!amount || isApproving}
                            >
                                {isApproving ? 'Approving...' : 'Approve'}
                            </Button>
                        ) : (
                            <Button
                                className="w-full"
                                size="lg"
                                onClick={handleSupply}
                                disabled={!amount || isSupplying}
                            >
                                {isSupplying ? 'Supplying...' : 'Supply'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}