'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Address, parseUnits, formatUnits } from 'viem';
import { useAccount } from 'wagmi';
import { Button } from '@/components/shared/Button';
import { ArrowLeft, Info, Wallet } from 'lucide-react';
import { formatAddress } from '@/lib/utils';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
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
    const poolIndex = poolAddresses.findIndex(
        (addr) => addr.toLowerCase() === poolAddress.toLowerCase()
    );
    const pool = poolIndex !== -1 ? pools[poolIndex] : undefined;

    // Get user supply shares
    const {
        userSupplyShares,
        totalSupplyAssets,
        totalSupplyShares,
        totalBorrowAssets,
        interestRate,
    } = useLendingPool(poolAddress);

    // Contract state
    const { writeContract, isPending: isWithdrawPending } = useWriteContract();
    const { data: receipt, isLoading: isConfirming } =
        useWaitForTransactionReceipt({
            hash: txHash,
        });

    // Calculate available withdrawal amount
    const availableWithdrawal =
        userSupplyShares &&
        totalSupplyAssets &&
        totalSupplyShares &&
        totalSupplyShares > 0n
            ? (userSupplyShares * totalSupplyAssets) / totalSupplyShares
            : 0n;

    // Calculate amount left after withdrawal
    const assetsLeftAfterWithdrawal =
        availableWithdrawal && amount
            ? availableWithdrawal - (parseUnits(amount, 18) || 0n)
            : availableWithdrawal;

    // Calculate utilization rate
    const utilizationRate =
        totalSupplyAssets && totalSupplyAssets > 0n
            ? (Number(totalBorrowAssets || 0n) / Number(totalSupplyAssets)) *
              100
            : 0;

    // Calculate supply APY (simplified)
    const supplyAPY = interestRate
        ? Number(interestRate) * (utilizationRate / 100)
        : 0;

    // Calculate estimated yearly earnings on remaining balance
    const yearlyEarnings =
        assetsLeftAfterWithdrawal && assetsLeftAfterWithdrawal > 0n
            ? Number(formatUnits(assetsLeftAfterWithdrawal, 18)) *
              (supplyAPY / 100)
            : 0;

    // Watch for transaction completion
    useEffect(() => {
        if (receipt?.status === 'success') {
            toast.dismiss('tx-confirm');
            toast.success(
                `Successfully withdrew ${amount} ${pool?.loanTokenSymbol}!`
            );
            router.push(`/pools/${poolAddress}`);
        }
    }, [receipt, router, amount, pool?.loanTokenSymbol, poolAddress]);

    // Convert input amount to shares
    useEffect(() => {
        if (
            !amount ||
            !totalSupplyAssets ||
            !totalSupplyShares ||
            totalSupplyAssets === 0n
        )
            return;

        try {
            const assetsAmount = parseUnits(amount, 18);
            // Shares = amount * totalSupplyShares / totalSupplyAssets
            const shares =
                (assetsAmount * totalSupplyShares) / totalSupplyAssets;
            setWithdrawShares(shares);
        } catch (error) {
            console.error('Error calculating shares:', error);
        }
    }, [amount, totalSupplyAssets, totalSupplyShares]);

    // Handle withdraw
    const handleWithdraw = async () => {
        if (!withdrawShares || !pool) {
            return;
        }

        try {
            toast.loading('Please confirm the transaction...', {
                id: 'tx-confirm',
            });

            writeContract(
                {
                    address: poolAddress,
                    abi: lendingPoolABI,
                    functionName: 'withdraw',
                    args: [withdrawShares],
                },
                {
                    onSuccess: (hash) => {
                        setTxHash(hash);
                        toast.dismiss('tx-confirm');
                        toast.loading(
                            'Transaction submitted, waiting for confirmation...',
                            {
                                id: 'tx-confirm',
                            }
                        );
                    },
                    onError: (error) => {
                        console.error('Withdraw Error:', error);
                        toast.dismiss('tx-confirm');
                        toast.error('Failed to withdraw tokens');
                    },
                }
            );
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

    // Input validation
    const isExceedingAvailable = () => {
        if (!availableWithdrawal || !amount) return false;
        try {
            const amountBigInt = parseUnits(amount, 18);
            return amountBigInt > availableWithdrawal;
        } catch {
            return false;
        }
    };

    if (!pool) {
        return (
            <div className='container mx-auto px-4 py-8'>
                <div className='text-center'>
                    <h1 className='text-2xl font-bold mb-4'>Pool not found</h1>
                    <Button onClick={() => router.back()}>
                        <ArrowLeft className='size-4 mr-2' />
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <main className='container mx-auto px-4 py-8'>
            <Button
                variant='ghost'
                className='mb-6'
                onClick={() => router.push(`/pools/${poolAddress}`)}
            >
                <ArrowLeft className='size-4 mr-2' />
                Back to Pool Details
            </Button>

            <div className='max-w-xl mx-auto'>
                <div className='bg-card rounded-lg border p-6 space-y-6'>
                    <div>
                        <h1 className='text-2xl font-bold mb-2 px-2'>
                            Withdraw {pool.loanTokenSymbol}
                        </h1>
                        <p className='text-sm text-muted-foreground px-2'>
                            Withdraw your supplied {pool.loanTokenSymbol} from
                            the {pool.loanTokenSymbol}/
                            {pool.collateralTokenSymbol} pool
                        </p>
                    </div>

                    <div className='space-y-4'>
                        <div>
                            <div className='flex justify-between items-center mb-2 px-2'>
                                <label className='block text-sm font-medium'>
                                    Amount to Withdraw
                                </label>
                                <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                                    <Wallet className='size-3.5' />
                                    <span>
                                        Available:{' '}
                                        {formatTokenAmount(availableWithdrawal)}{' '}
                                        {pool.loanTokenSymbol}
                                    </span>
                                </div>
                            </div>

                            <div className='relative'>
                                <input
                                    type='number'
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder='0.00'
                                    className='w-full px-4 py-2 bg-background border rounded-md'
                                    disabled={isWithdrawPending || isConfirming}
                                />
                                <div className='absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2'>
                                    <button
                                        onClick={() =>
                                            availableWithdrawal &&
                                            setAmount(
                                                formatUnits(
                                                    availableWithdrawal,
                                                    18
                                                )
                                            )
                                        }
                                        className='text-xs text-primary hover:underline'
                                    >
                                        MAX
                                    </button>
                                    <span className='text-sm text-muted-foreground pr-8'>
                                        {pool.loanTokenSymbol}
                                    </span>
                                </div>
                            </div>

                            {isExceedingAvailable() && (
                                <p className='mt-1 text-sm text-destructive flex items-center gap-1'>
                                    <Info className='size-3.5' />
                                    Amount exceeds available balance
                                </p>
                            )}

                            <div className='flex gap-2 mt-3'>
                                {[25, 50, 75, 100].map((percentage) => (
                                    <Button
                                        key={percentage}
                                        size='sm'
                                        variant='outline'
                                        onClick={() =>
                                            handlePercentageClick(percentage)
                                        }
                                        disabled={
                                            isWithdrawPending || isConfirming
                                        }
                                        className='flex-1'
                                    >
                                        {percentage}%
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className='bg-muted/50 rounded-lg p-4 space-y-3'>
                            <div className='flex justify-between items-center'>
                                <div className='text-sm text-muted-foreground'>
                                    Your Supplied Assets
                                </div>
                                <div className='font-medium'>
                                    {formatTokenAmount(availableWithdrawal)}{' '}
                                    {pool.loanTokenSymbol}
                                </div>
                            </div>

                            <div className='flex justify-between items-center'>
                                <div className='text-sm text-muted-foreground'>
                                    Assets Left After Withdrawal
                                </div>
                                <div className='font-medium'>
                                    {formatTokenAmount(
                                        assetsLeftAfterWithdrawal
                                    )}{' '}
                                    {pool.loanTokenSymbol}
                                </div>
                            </div>

                            <div className='flex justify-between items-center'>
                                <div className='text-sm text-muted-foreground'>
                                    Current APY
                                </div>
                                <div className='font-medium text-green-600'>
                                    {formatPercentage(supplyAPY)}
                                </div>
                            </div>

                            <div className='flex justify-between items-center'>
                                <div className='text-sm text-muted-foreground'>
                                    Estimated Yearly Earnings
                                </div>
                                <div className='font-medium text-green-600'>
                                    {yearlyEarnings.toFixed(4)}{' '}
                                    {pool.loanTokenSymbol}
                                </div>
                            </div>

                            <div className='flex justify-between items-center'>
                                <div className='text-sm text-muted-foreground'>
                                    Pool Address
                                </div>
                                <div className='font-mono text-xs'>
                                    {formatAddress(poolAddress)}
                                </div>
                            </div>

                            {txHash && (
                                <div className='flex justify-between items-center'>
                                    <div className='text-sm text-muted-foreground'>
                                        Transaction
                                    </div>
                                    <div className='font-mono text-xs'>
                                        {formatAddress(txHash)}
                                    </div>
                                </div>
                            )}
                        </div>

                        <Button
                            className='w-full'
                            size='lg'
                            onClick={handleWithdraw}
                            disabled={
                                !amount ||
                                isExceedingAvailable() ||
                                isWithdrawPending ||
                                isConfirming ||
                                Number(amount) <= 0 ||
                                !availableWithdrawal ||
                                availableWithdrawal === 0n
                            }
                        >
                            {isConfirming
                                ? 'Confirming...'
                                : isWithdrawPending
                                ? 'Withdrawing...'
                                : 'Withdraw'}
                        </Button>
                    </div>
                </div>
            </div>
        </main>
    );
}

// Helper function to format percentage
const formatPercentage = (value: number) => {
    return (
        value.toLocaleString(undefined, {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
        }) + '%'
    );
};
