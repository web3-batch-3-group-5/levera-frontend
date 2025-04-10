'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Address,
  parseUnits,
  formatUnits,
  zeroAddress,
  maxUint256,
} from 'viem';
import { useAccount } from 'wagmi';
import { Button } from '@/components/shared/Button';
import { ArrowLeft, Info, WalletIcon } from 'lucide-react';
import { formatAddress } from '@/lib/utils';
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { erc20Abi } from 'viem';
import { toast } from 'sonner';
import { lendingPoolABI } from '@/lib/abis/lendingPool';
import { useLendingPoolFactory } from '@/hooks/useLendingPoolFactory';
import { formatTokenAmount } from '@/lib/utils/format';

export default function SupplyPage() {
  const params = useParams();
  const router = useRouter();
  const { address: userAddress } = useAccount();
  const poolAddress = params.address as Address;

  console.log('Page loaded - Pool Address:', poolAddress);
  console.log('User Address:', userAddress);

  // State management
  const [amount, setAmount] = useState('');
  const [supplyAmount, setSupplyAmount] = useState<bigint>(0n);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [needsApproval, setNeedsApproval] = useState(false);

  // Get pool details
  const { poolAddresses, pools } = useLendingPoolFactory();
  console.log('Pool Addresses:', poolAddresses);

  const poolIndex = poolAddresses.findIndex(
    (addr) => addr.toLowerCase() === poolAddress.toLowerCase()
  );
  const pool = poolIndex !== -1 ? pools[poolIndex] : undefined;

  console.log('Selected Pool:', pool);

  // Contract state
  const { writeContract, isPending: isSupplyPending } = useWriteContract();
  const { data: receipt, isLoading: isConfirming } =
    useWaitForTransactionReceipt({ hash: txHash });

  // Check token balance and allowance
  const { data: tokenBalance } = useReadContract({
    address: pool?.loanToken,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [userAddress || zeroAddress],
  });

  const { data: currentAllowance, refetch: refetchAllowance } = useReadContract(
    {
      address: pool?.loanToken,
      abi: erc20Abi,
      functionName: 'allowance',
      args: [userAddress || zeroAddress, poolAddress],
    }
  );

  console.log('Token Balance:', tokenBalance);
  console.log('Current Allowance:', currentAllowance);

  // Check if approval is needed whenever amount or allowance changes
  useEffect(() => {
    const checkApproval = async () => {
      if (!pool || !userAddress || !amount) {
        setNeedsApproval(false);
        return;
      }

      try {
        await refetchAllowance();

        // Only mark as needing approval if amount is greater than 0 and allowance is insufficient
        const amountBigInt = parseUnits(amount || '0', pool.loanTokenDecimals);
        const needsApproval =
          amountBigInt > 0n &&
          (currentAllowance === undefined || currentAllowance < amountBigInt);

        setNeedsApproval(needsApproval);
      } catch (error) {
        console.error('Error checking allowance:', error);
      }
    };

    checkApproval();
  }, [
    amount,
    userAddress,
    currentAllowance,
    pool,
    pool?.loanTokenDecimals,
    refetchAllowance,
  ]);

  // Update supplyAmount when amount changes
  useEffect(() => {
    if (!amount || !pool) {
      setSupplyAmount(0n);
      return;
    }

    try {
      const parsedAmount = parseUnits(amount, pool.loanTokenDecimals);
      console.log('Parsed Amount:', parsedAmount);
      setSupplyAmount(parsedAmount);
    } catch (error) {
      console.error('Error parsing amount:', error);
    }
  }, [amount, pool]);

  // Watch for transaction completion
  useEffect(() => {
    if (receipt?.status === 'success') {
      console.log('Transaction Successful:', receipt);

      toast.dismiss('tx-confirm');

      if (needsApproval) {
        // After approval, stay on the page but update approval status
        toast.success('Token approved successfully!');
        refetchAllowance().then(() => {
          setNeedsApproval(false);
          setTxHash(undefined);
        });
      } else {
        // After successful supply, show toast and redirect to pool details
        toast.success(
          `Successfully supplied ${formatTokenAmount(supplyAmount, {
            decimals: pool?.loanTokenDecimals,
          })} ${pool?.loanTokenSymbol}!`
        );

        // Redirect to pool details after a brief delay
        setTimeout(() => {
          router.push(`/pools/${poolAddress}`);
        }, 2000); // 2 second delay to show the success message
      }
    }
  }, [
    receipt,
    router,
    supplyAmount,
    pool?.loanTokenSymbol,
    poolAddress,
    needsApproval,
    refetchAllowance,
  ]);

  // Handle token approval
  const handleApprove = async () => {
    if (!pool) return;

    try {
      console.log('Approving tokens...');
      toast.loading('Please confirm the approval in your wallet...', {
        id: 'approve-confirm',
      });

      writeContract(
        {
          address: pool.loanToken,
          abi: erc20Abi,
          functionName: 'approve',
          args: [poolAddress, maxUint256],
        },
        {
          onSuccess: (hash) => {
            console.log('Approval transaction hash:', hash);
            setTxHash(hash);
            toast.dismiss('approve-confirm');
            toast.loading('Approval transaction submitted...', {
              id: 'tx-confirm',
            });
          },
          onError: (error) => {
            console.error('Approval Error:', error);
            toast.dismiss('approve-confirm');
            toast.error('Failed to approve token');
          },
        }
      );
    } catch (error) {
      console.error('Approval Error:', error);
      toast.dismiss('approve-confirm');
      toast.error('Failed to approve token');
    }
  };

  // Handle supply
  const handleSupply = async () => {
    if (!supplyAmount || !pool || supplyAmount <= 0n) {
      console.log('Supply validation failed:', {
        supplyAmount: supplyAmount.toString(),
        pool,
      });
      return;
    }

    try {
      console.log('Supplying tokens...', {
        amount: supplyAmount.toString(),
        poolAddress,
        userAddress,
      });

      toast.loading('Please confirm the transaction...', { id: 'tx-confirm' });

      writeContract(
        {
          address: poolAddress,
          abi: lendingPoolABI,
          functionName: 'supply',
          args: [supplyAmount],
        },
        {
          onSuccess: (hash) => {
            console.log('Supply transaction hash:', hash);
            setTxHash(hash);
            toast.dismiss('tx-confirm');
            toast.loading(
              'Transaction submitted, waiting for confirmation...',
              { id: 'tx-confirm' }
            );
          },
          onError: (error) => {
            console.error('Supply Error:', error);
            toast.dismiss('tx-confirm');
            toast.error('Failed to supply tokens');
          },
        }
      );
    } catch (error) {
      console.error('Error in supply process:', error);
      toast.dismiss('tx-confirm');
      toast.error('Failed to supply tokens');
    }
  };

  // Handle percentage buttons
  const handlePercentageClick = (percentage: number) => {
    if (!tokenBalance) return;
    const amount =
      (Number(formatUnits(tokenBalance, pool?.loanTokenDecimals || 18)) *
        percentage) /
      100;
    setAmount(amount.toString());
  };

  // Input validation
  const isExceedingBalance = () => {
    if (!tokenBalance || !amount) return false;
    try {
      const amountBigInt = parseUnits(amount, pool?.loanTokenDecimals || 18);
      return amountBigInt > tokenBalance;
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

  const availableBalance = tokenBalance
    ? formatTokenAmount(tokenBalance, { decimals: pool.loanTokenDecimals })
    : '0.00';

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
              Supply {pool.loanTokenSymbol}
            </h1>
            <p className='text-sm text-muted-foreground px-2'>
              Supply {pool.loanTokenSymbol} to earn interest in the{' '}
              {pool.loanTokenSymbol}/{pool.collateralTokenSymbol} pool
            </p>
          </div>

          <div className='space-y-4'>
            <div>
              <div className='flex justify-between items-center mb-2 px-2'>
                <label className='block text-sm font-medium'>
                  Amount to Supply
                </label>
                <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                  <WalletIcon className='size-3.5' />
                  <span>
                    Balance: {availableBalance} {pool.loanTokenSymbol}
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
                  disabled={isSupplyPending || isConfirming}
                />
                <div className='absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2'>
                  <button
                    onClick={() =>
                      tokenBalance && setAmount(formatUnits(tokenBalance, 18))
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

              {isExceedingBalance() && (
                <p className='mt-1 text-sm text-destructive flex items-center gap-1'>
                  <Info className='size-3.5' />
                  Insufficient balance
                </p>
              )}
            </div>

            <div className='flex gap-2'>
              {[25, 50, 75, 100].map((percentage) => (
                <Button
                  key={percentage}
                  size='sm'
                  variant='outline'
                  onClick={() => handlePercentageClick(percentage)}
                  disabled={isSupplyPending || isConfirming}
                  className='flex-1'
                >
                  {percentage}%
                </Button>
              ))}
            </div>

            <div className='bg-muted/50 rounded-lg p-4 space-y-3'>
              <div className='flex justify-between items-center'>
                <div className='text-sm text-muted-foreground'>
                  You will receive
                </div>
                <div className='font-medium'>
                  {amount ? amount : '0.00'} {pool.loanTokenSymbol}
                </div>
              </div>

              <div className='flex justify-between items-center'>
                <div className='text-sm text-muted-foreground'>Current APR</div>
                <div className='font-medium text-green-600'>
                  {pool.interestRate
                    ? Number(pool.interestRate).toFixed(2)
                    : '0.00'}
                  %
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

            {needsApproval ? (
              <Button
                className='w-full'
                size='lg'
                onClick={handleApprove}
                disabled={
                  !amount ||
                  isExceedingBalance() ||
                  isSupplyPending ||
                  isConfirming ||
                  Number(amount) <= 0
                }
              >
                {isConfirming ? 'Approving...' : 'Approve'}
              </Button>
            ) : (
              <Button
                className='w-full'
                size='lg'
                onClick={handleSupply}
                disabled={
                  !amount ||
                  isExceedingBalance() ||
                  isSupplyPending ||
                  isConfirming ||
                  Number(amount) <= 0
                }
              >
                {isConfirming
                  ? 'Confirming...'
                  : isSupplyPending
                  ? 'Supplying...'
                  : 'Supply'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
