'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Address, parseUnits, formatUnits } from 'viem';
import { useAccount } from 'wagmi';
import { Button } from '@/components/shared/Button';
import { ArrowLeft } from 'lucide-react';
import { formatAddress } from '@/lib/utils';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { toast } from 'sonner';
import { lendingPoolABI } from '@/lib/abis/lendingPool';
import { useLendingPoolFactory } from '@/hooks/useLendingPoolFactory';
import { useLendingPool } from '@/hooks/useLendingPool';
import { formatTokenAmount } from '@/lib/utils/format';

export default function WithdrawPage() {
    const params = useParams();
    const router = useRouter();
    const { address: userAddress } = useAccount();
    const poolAddress = params.address as Address;

    // State management
    const [amount, setAmount] = useState('');
    const [withdrawShares, setWithdrawShares] = useState<bigint>(0n);
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);

    // Get pool details
    const { poolAddresses, pools } = useLendingPoolFactory();
    const poolIndex = poolAddresses.findIndex(addr => addr.toLowerCase() === poolAddress.toLowerCase());
    const pool = poolIndex !== -1 ? pools[poolIndex] : undefined;

    // Get user supply shares
    const { userSupplyShares, totalSupplyAssets, totalSupplyShares } = useLendingPool(poolAddress);

    // Contract state
    const { writeContract, isPending: isWithdrawPending } = useWriteContract();
    const { data: receipt, isLoading: isConfirming } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    // Calculate available withdrawal amount
    const availableWithdrawal = userSupplyShares && totalSupplyAssets && totalSupplyShares && totalSupplyShares > 0n
        ? (userSupplyShares * totalSupplyAssets) / totalSupplyShares
        : 0n;

    // Watch for transaction completion
    useEffect(() => {
        if (receipt?.status === 'success') {
            toast.dismiss('tx-confirm');
            toast.success(`Successfully withdrew ${formatTokenAmount(withdrawShares)} shares!`);
            router.push(`/pools/${poolAddress}`);
        }
    }, [receipt, router, withdrawShares, poolAddress]);

    // Convert input amount to shares
    useEffect(() => {
        if (!amount || !totalSupplyAssets || !totalSupplyShares || totalSupplyAssets === 0n) return;

        try {
            const assetsAmount = parseUnits(amount, 18);
            // Simple conversion - in a real app you'd use the contract's conversion method
            const shares = totalSupplyShares * assetsAmount / totalSupplyAssets;
            setWithdrawShares(shares);
        } catch (error) {
            console.error('Error calculating shares:', error);
        }
    }, [amount, totalSupplyAssets, totalSupplyShares]);

    // Handle withdraw
    const handleWithdraw = async () => {
        if (!withdrawShares || !pool) {
            console.log('Withdraw validation failed:', { withdrawShares: withdrawShares.toString(), pool });
            return;
        }

        try {
            console.log('Preparing withdraw transaction:', {
                shares: withdrawShares.toString(),
                poolAddress,
                userAddress
            });

            toast.loading('Please confirm the transaction...', { id: 'tx-confirm' });

            const hash = await writeContract({
                address: poolAddress,
                abi: lendingPoolABI,
                functionName: 'withdraw',
                args: [withdrawShares],
            });

            console.log('Withdraw transaction hash:', hash);
            setTxHash(hash);
            toast.dismiss('tx-confirm');
            toast.loading('Transaction submitted, waiting for confirmation...', {
                id: 'tx-confirm'
            });
        } catch (error) {
            console.error('Error in withdraw process:', error);
            toast.dismiss('tx-confirm');
            toast.error('Failed to withdraw tokens');
        }
    };

    // Handle percentage buttons
    const handlePercentageClick = (percentage: number) => {
        if (!availableWithdrawal) return;
        const maxAmount = Number(formatUnits(availableWithdrawal, 18));
        const amount = (maxAmount * percentage) / 100;
        setAmount(amount.toString());
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
                            Withdraw {pool.loanTokenSymbol}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Withdraw your supplied {pool.loanTokenSymbol} from the pool
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Amount to Withdraw
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full px-4 py-2 bg-background border rounded-md"
                                    disabled={isWithdrawPending || isConfirming}
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    <button
                                        onClick={() => availableWithdrawal && setAmount(formatUnits(availableWithdrawal, 18))}
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
                                Available: {formatTokenAmount(availableWithdrawal)} {pool.loanTokenSymbol}
                            </p>
                            
                            <div className="flex gap-2 mt-3">
                                {[25, 50, 75, 100].map((percentage) => (
                                    <Button
                                        key={percentage}
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handlePercentageClick(percentage)}
                                        disabled={isWithdrawPending || isConfirming}
                                    >
                                        {percentage}%
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Pool Address</span>
                                <span className="font-mono">{formatAddress(poolAddress)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Your Supply Shares</span>
                                <span>{formatTokenAmount(userSupplyShares)}</span>
                            </div>
                            {txHash && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Transaction</span>
                                    <span className="font-mono">{formatAddress(txHash)}</span>
                                </div>
                            )}
                        </div>

                        <Button
                            className="w-full"
                            size="lg"
                            onClick={handleWithdraw}
                            disabled={!amount || isWithdrawPending || isConfirming || Number(amount) === 0 || (availableWithdrawal && parseUnits(amount, 18) > availableWithdrawal)}
                        >
                            {isConfirming ? 'Confirming...' : isWithdrawPending ? 'Withdrawing...' : 'Withdraw'}
                        </Button>
                    </div>
                </div>
            </div>
        </main>
    );
}