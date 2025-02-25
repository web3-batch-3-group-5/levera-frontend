'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Address, parseUnits, formatUnits, zeroAddress } from 'viem';
import { useAccount } from 'wagmi';
import { Button } from '@/components/shared/Button';
import { ArrowLeft } from 'lucide-react';
import { formatAddress } from '@/lib/utils';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { erc20Abi } from 'viem';
import { toast } from 'sonner';
import { lendingPoolABI } from '@/lib/abis/lendingPool';
import { useLendingPoolFactory } from '@/hooks/useLendingPoolFactory';

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
    const { address: userAddress } = useAccount();
    const poolAddress = params.address as Address;

    // State management
    const [amount, setAmount] = useState('');
    const [supplyAmount, setSupplyAmount] = useState<bigint>(0n);
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
    const [needsApproval, setNeedsApproval] = useState(false);

    // Get pool details
    const { poolAddresses, pools } = useLendingPoolFactory();
    const poolIndex = poolAddresses.findIndex(addr => addr.toLowerCase() === poolAddress.toLowerCase());
    const pool = poolIndex !== -1 ? pools[poolIndex] : undefined;

    // Contract state
    const { writeContract, isPending: isSupplyPending } = useWriteContract();
    const { data: receipt, isLoading: isConfirming } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    // Check token balance and allowance
    const { data: tokenBalance } = useReadContract({
        address: pool?.loanToken,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [userAddress || zeroAddress],
    });

    const { data: currentAllowance } = useReadContract({
        address: pool?.loanToken,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [userAddress || zeroAddress, poolAddress],
    });

    // Watch for transaction completion
    useEffect(() => {
        console.log('Transaction state:', { receipt, txHash, isConfirming });

        if (receipt?.status === 'success') {
            toast.dismiss('tx-confirm');
            toast.success(`Successfully supplied ${formatTokenAmount(supplyAmount)} ${pool?.loanTokenSymbol}!`);
            router.push(`/pools/${poolAddress}`);
        }
    }, [receipt, router, supplyAmount, pool?.loanTokenSymbol, poolAddress, txHash, isConfirming]);

    // Check if approval is needed
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

    // Handle token approval
    const handleApprove = async () => {
        if (!pool || !supplyAmount) return;

        try {
            toast.loading('Please confirm the approval in your wallet...', { id: 'approve-confirm' });

            writeContract({
                address: pool.loanToken,
                abi: erc20Abi,
                functionName: 'approve',
                args: [poolAddress, supplyAmount],
            }, {
                onSuccess: (hash) => {
                    console.log('Approval transaction hash:', hash);
                    toast.dismiss('approve-confirm');
                    toast.success('Token approved successfully!');
                    setNeedsApproval(false);
                },
                onError: (error) => {
                    console.error('Approval Error:', error);
                    toast.dismiss('approve-confirm');
                    toast.error('Failed to approve token');
                },
            });
        } catch (error) {
            console.error('Error in approval process:', error);
            toast.dismiss('approve-confirm');
            toast.error('Failed to approve token');
        }
    };

    // Handle supply
    const handleSupply = async () => {
        if (!supplyAmount || !pool) {
            console.log('Supply validation failed:', { supplyAmount: supplyAmount.toString(), pool });
            return;
        }

        try {
            console.log('Preparing supply transaction:', {
                amount: supplyAmount.toString(),
                poolAddress,
                userAddress
            });

            toast.loading('Please confirm the transaction...', { id: 'tx-confirm' });

            writeContract({
                address: poolAddress,
                abi: lendingPoolABI,
                functionName: 'supply',
                args: [supplyAmount],
            }, {
                onSuccess: (hash) => {
                    console.log('Supply transaction hash:', hash);
                    setTxHash(hash);
                    toast.dismiss('tx-confirm');
                    toast.loading('Transaction submitted, waiting for confirmation...', {
                        id: 'tx-confirm'
                    });
                },
                onError: (error) => {
                    console.error('Supply Error:', error);
                    toast.dismiss('tx-confirm');
                    toast.error('Failed to supply tokens');
                },
            });
        } catch (error) {
            console.error('Error in supply process:', error);
            toast.dismiss('tx-confirm');
            toast.error('Failed to supply tokens');
        }
    };

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
                                    disabled={isSupplyPending || isConfirming}
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
                            {txHash && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Transaction</span>
                                    <span className="font-mono">{formatAddress(txHash)}</span>
                                </div>
                            )}
                        </div>

                        {needsApproval ? (
                            <Button
                                className="w-full"
                                size="lg"
                                onClick={handleApprove}
                                disabled={!amount || isSupplyPending}
                            >
                                {isSupplyPending ? 'Approving...' : 'Approve'}
                            </Button>
                        ) : (
                            <Button
                                className="w-full"
                                size="lg"
                                onClick={handleSupply}
                                disabled={!amount || isSupplyPending || isConfirming}
                            >
                                {isConfirming ? 'Confirming...' : isSupplyPending ? 'Supplying...' : 'Supply'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}