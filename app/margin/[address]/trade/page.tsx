'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
import { useLendingPool } from '@/hooks/useLendingPool';
import { useLendingPoolFactory } from '@/hooks/useLendingPoolFactory';
import { formatTokenAmount } from '@/lib/utils/format';
import {
    useReadContract,
    useWriteContract,
    useWaitForTransactionReceipt,
} from 'wagmi';
import { erc20Abi } from 'viem';
import { toast } from 'sonner';
import { LiquidationCalculator } from '@/lib/health';
import { convertPrice } from '@/lib/convertPrice';
import { CONTRACTS, PoolDetails } from '@/config/contracts';

export default function MarginTradePage() {
    const router = useRouter();
    const params = useParams();
    const poolAddress = params.address as Address;
    const { address: userAddress } = useAccount();

    // State management
    const [collateralAmount, setCollateralAmount] = useState('');
    const [leverage, setLeverage] = useState(1.5);
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
    const [needsApproval, setNeedsApproval] = useState(true);
    const [approvalStep, setApprovalStep] = useState<
        'none' | 'wallet' | 'factory'
    >('none');
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Get pool data
    const { poolAddresses, pools } = useLendingPoolFactory();
    const poolIndex = poolAddresses.findIndex(
        (addr) => addr.toLowerCase() === poolAddress.toLowerCase()
    );
    const pool = poolIndex !== -1 ? pools[poolIndex] : undefined;

    // Get pool details for risk calculations
    const { ltp } = useLendingPool(poolAddress);

    // Contract functions
    const { writeContract, isPending: isWritePending } = useWriteContract();

    // Transaction confirmation
    const { isLoading: isConfirming, data: receipt } =
        useWaitForTransactionReceipt({
            hash: txHash,
        });

    // Get token balance
    const { data: walletBalance } = useReadContract({
        address: pool?.collateralToken,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [userAddress || zeroAddress],
    });

    // Get token allowance for wallet
    const { data: walletAllowance, refetch: refetchWalletAllowance } =
        useReadContract({
            address: pool?.collateralToken,
            abi: erc20Abi,
            functionName: 'allowance',
            args: [
                userAddress || zeroAddress,
                CONTRACTS.POSITION_FACTORY.address,
            ],
        });

    // Check if approval is needed
    useEffect(() => {
        if (!walletAllowance || !pool?.collateralToken) return;

        try {
            // Only need approval if allowance is very small
            if (walletAllowance < parseUnits('1', 18)) {
                setNeedsApproval(true);
            } else {
                setNeedsApproval(false);
            }
        } catch (error) {
            console.error('Error checking allowance:', error);
        }
    }, [walletAllowance, pool?.collateralToken]);

    // Watch for transaction completion
    useEffect(() => {
        if (receipt?.status === 'success') {
            toast.dismiss('tx-confirm');

            if (needsApproval) {
                // Handle wallet approval completion
                if (approvalStep === 'wallet') {
                    toast.success('Token approved successfully!');
                    refetchWalletAllowance().then(() => {
                        // After wallet approval, check if factory approval is needed
                        setNeedsApproval(false);
                        setApprovalStep('none');
                        setTxHash(undefined);
                    });
                }
            } else {
                // Position created successfully
                toast.success('Position created successfully!');
                router.push(`/margin/${poolAddress}`);
            }
        }
    }, [
        receipt,
        router,
        poolAddress,
        needsApproval,
        approvalStep,
        refetchWalletAllowance,
    ]);

    // Calculate position details based on contract logic
    const calculatePositionDetails= (pool?: PoolDetails) => {
        if (!collateralAmount || !pool || !leverage) {
            return {
                borrowAmount: 0n,
                liquidationPrice: '0.00',
                healthFactor: 1.0,
                loanToValue: 0.33,
                effectiveCollateral: 0,
            };
        }

        try {
            const collateralValue = parseFloat(collateralAmount);

            // Following the contract logic in PositionFactory.createPosition
            // Convert leverage from decimal (1.5) to basis points (150)
            const leverageBasisPoints = Math.floor(leverage * 100);

            // baseCollateral * (leverage - 100) / 100
            const borrowCollateral =
                (collateralValue * (leverageBasisPoints - 100)) / 100;

            // Simple approximation for borrowAmount
            const borrowAmount = convertPrice(
                pool.loanTokenSymbol, pool.collateralTokenSymbol, borrowCollateral
            );

            const effectiveCollateral = collateralValue * leverageBasisPoints / 100;
            const effectiveCollateralPrice = convertPrice(
                pool.loanTokenSymbol, pool.collateralTokenSymbol, effectiveCollateral
            );

            // Use LiquidationCalculator from health.ts
            const calculator = new LiquidationCalculator(ltp || 80n);
            const liquidationPrice = calculator.getLiquidationPrice(effectiveCollateral, borrowAmount);
            const healthFactor = calculator.getHealth(effectiveCollateralPrice, borrowAmount);
            const loanToValue = calculator.getLTV(effectiveCollateralPrice, borrowAmount);

            return {
                borrowAmount: parseUnits(borrowAmount.toFixed(18), 18),
                liquidationPrice: liquidationPrice.toFixed(2),
                healthFactor: healthFactor,
                loanToValue: loanToValue,
                effectiveCollateral: effectiveCollateral,
            };
        } catch (error) {
            console.error('Error calculating position details:', error);
            return {
                borrowAmount: 0n,
                liquidationPrice: '0.00',
                healthFactor: 1.0,
                loanToValue: 0.33,
                effectiveCollateral: 0,
            };
        }
    };

    const positionDetails = calculatePositionDetails(pool);

    // Handle percentage buttons
    const handlePercentageClick = (percentage: number) => {
        if (!walletBalance) return;
        const amount =
            (Number(formatUnits(walletBalance, 18)) * percentage) / 100;
        setCollateralAmount(amount.toString());
    };

    // Input validation
    const isExceedingBalance = () => {
        if (!walletBalance || !collateralAmount) return false;
        try {
            const amount = parseUnits(collateralAmount, 18);
            return amount > walletBalance;
        } catch {
            return false;
        }
    };

    // Approve collateral tokens
    const handleApproveWallet = async () => {
        if (!pool || !userAddress) return;

        try {
            toast.loading('Approving wallet...', { id: 'approve-tx' });

            writeContract(
                {
                    address: pool.collateralToken,
                    abi: erc20Abi,
                    functionName: 'approve',
                    args: [CONTRACTS.POSITION_FACTORY.address, maxUint256],
                },
                {
                    onSuccess: (hash) => {
                        console.log('Wallet approval transaction hash:', hash);
                        setTxHash(hash);
                        toast.dismiss('approve-tx');
                        toast.loading('Approval transaction submitted...', {
                            id: 'tx-confirm',
                        });
                    },
                    onError: (error) => {
                        console.error('Wallet approval error:', error);
                        toast.dismiss('approve-tx');
                        toast.error('Failed to approve token');
                    },
                }
            );
        } catch (error) {
            console.error('Wallet approval error:', error);
            toast.dismiss('approve-tx');
            toast.error('Failed to approve token');
        }
    };

    // Open position with fixed leverage conversion
    const handleOpenPosition = async () => {
        if (!collateralAmount || !pool || !userAddress) return;

        try {
            const collateralAmountBigInt = parseUnits(collateralAmount, 18);

            // Convert leverage from decimal (e.g., 1.5) to basis points (e.g., 150)
            // Important: Contract expects leverage in basis points (100 = 1x)
            const leverageBasisPoints = BigInt(Math.floor(leverage * 100));

            console.log('Creating position with:', {
                poolAddress,
                collateralAmount: collateralAmountBigInt.toString(),
                leverageUI: leverage,
                leverageBasisPoints: leverageBasisPoints.toString(),
            });

            toast.loading('Creating position...', { id: 'create-position' });

            writeContract(
                {
                    address: CONTRACTS.POSITION_FACTORY.address,
                    abi: CONTRACTS.POSITION_FACTORY.abi,
                    functionName: 'createPosition',
                    args: [
                        poolAddress,
                        collateralAmountBigInt,
                        leverageBasisPoints, // Fixed: Send basis points to contract (e.g., 150 for 1.5x)
                    ],
                },
                {
                    onSuccess: (hash) => {
                        console.log(
                            'Position creation transaction hash:',
                            hash
                        );
                        setTxHash(hash);
                        toast.dismiss('create-position');
                        toast.loading(
                            'Transaction submitted, waiting for confirmation...',
                            {
                                id: 'tx-confirm',
                            }
                        );
                    },
                    onError: (error) => {
                        console.error('Position creation Error:', error);
                        toast.dismiss('create-position');
                        toast.error(
                            'Failed to create position: ' + error.message
                        );
                    },
                }
            );
        } catch (error) {
            console.error('Error creating position:', error);
            toast.dismiss('create-position');
            toast.error('Failed to create position');
        }
    };

    // Get the appropriate button label
    const getButtonLabel = () => {
        if (isConfirming || isWritePending) {
            if (needsApproval && approvalStep === 'wallet')
                return 'Approving Wallet...';
            if (needsApproval && approvalStep === 'factory')
                return 'Approving Factory...';
            return 'Creating Position...';
        }

        if (needsApproval) {
            if (approvalStep === 'wallet') return 'Approve Wallet';
            if (approvalStep === 'factory') return 'Approve Position Factory';
        }

        return 'Create Position';
    };

    // Handle button click based on current step
    const handleButtonClick = () => {
        if (needsApproval) {
            if (approvalStep === 'wallet') {
                handleApproveWallet();
            }
        } else {
            handleOpenPosition();
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
                onClick={() => router.back()}
            >
                <ArrowLeft className='size-4 mr-2' />
                Back
            </Button>

            <div className='max-w-xl mx-auto'>
                <div className='bg-card rounded-lg border p-6 space-y-6'>
                    <div>
                        <h1 className='text-xl font-bold mb-2 px-2'>
                            {pool.loanTokenSymbol}/{pool.collateralTokenSymbol}{' '}
                            Trade
                        </h1>
                        <p className='text-sm text-muted-foreground px-2'>
                            Open a margin position with this pool
                        </p>
                    </div>

                    {/* Collateral Input */}
                    <div className='space-y-4'>
                        <div className='flex justify-between items-center px-2'>
                            <h2 className='text-lg font-medium'>Collateral</h2>
                            <div className='text-sm text-muted-foreground'>
                                Balance:{' '}
                                {formatTokenAmount(walletBalance || 0n)}{' '}
                                {pool.collateralTokenSymbol}
                            </div>
                        </div>

                        <div className='relative'>
                            <input
                                type='number'
                                value={collateralAmount}
                                onChange={(e) =>
                                    setCollateralAmount(e.target.value)
                                }
                                className='w-full bg-background p-3 rounded border'
                                placeholder='0.00'
                                disabled={isWritePending || isConfirming}
                            />
                            <div className='absolute right-3 top-1/2 -translate-y-1/2'>
                                <span className='text-sm font-medium pr-6'>
                                    {pool.collateralTokenSymbol}
                                </span>
                            </div>
                        </div>

                        {isExceedingBalance() && (
                            <p className='text-sm text-red-500 flex items-center gap-1'>
                                <Info className='size-4' />
                                Insufficient balance
                            </p>
                        )}

                        <div className='flex gap-2'>
                            {[25, 50, 75, 100].map((percentage) => (
                                <Button
                                    key={percentage}
                                    variant='outline'
                                    onClick={() =>
                                        handlePercentageClick(percentage)
                                    }
                                    className='flex-1'
                                    disabled={isWritePending || isConfirming}
                                >
                                    {percentage}%
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Leverage Slider */}
                    <div className='space-y-2'>
                        <div className='flex justify-between px-2'>
                            <span>Leverage</span>
                            <span>{leverage.toFixed(2)}x</span>
                        </div>
                        <input
                            type='range'
                            min='1.0'
                            max='3'
                            step='0.1'
                            value={leverage}
                            onChange={(e) =>
                                setLeverage(parseFloat(e.target.value))
                            }
                            className='w-full'
                            disabled={isWritePending || isConfirming}
                        />
                        <div className='flex justify-between text-xs text-muted-foreground px-1'>
                            <span>1x</span>
                            <span>2x</span>
                            <span>3x</span>
                        </div>
                    </div>

                    {/* Position Summary */}
                    <div className='bg-muted/50 rounded-lg p-4 space-y-3'>
                        <div className='flex justify-between'>
                            <span className='text-sm text-muted-foreground'>
                                Base Collateral
                            </span>
                            <span>
                                {parseFloat(collateralAmount || '0').toFixed(4)}{' '}
                                {pool?.collateralTokenSymbol}
                            </span>
                        </div>
                        <div className='flex justify-between'>
                            <span className='text-sm text-muted-foreground'>
                                Effective Collateral
                            </span>
                            <span>
                                {positionDetails.effectiveCollateral.toFixed(4)}{' '}
                                {pool?.collateralTokenSymbol}
                            </span>
                        </div>
                        <div className='flex justify-between'>
                            <span className='text-sm text-muted-foreground'>
                                Borrow Amount
                            </span>
                            <span>{formatUnits(positionDetails.borrowAmount, 18)} {pool.loanTokenSymbol}</span>
                        </div>
                        <div className='flex justify-between'>
                            <span className='text-sm text-muted-foreground'>
                                Liquidation Price
                            </span>
                            <span>${positionDetails.liquidationPrice}</span>
                        </div>
                        <div className='flex justify-between'>
                            <span className='text-sm text-muted-foreground'>
                                Health Factor
                            </span>
                            <span
                                className={
                                    positionDetails.healthFactor < 1.1
                                        ? 'text-red-500'
                                        : positionDetails.healthFactor < 1.3
                                        ? 'text-yellow-500'
                                        : 'text-green-500'
                                }
                            >
                                {positionDetails.healthFactor.toFixed(2)}
                            </span>
                        </div>
                        <div className='flex justify-between'>
                            <span className='text-sm text-muted-foreground'>
                                Loan to Value
                            </span>
                            <span>
                                {(positionDetails.loanToValue * 100).toFixed(2)}
                                %
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {needsApproval ? (
                        <Button
                            className='w-full'
                            size='lg'
                            onClick={handleApproveWallet}
                            disabled={!pool || isWritePending || isConfirming}
                        >
                            {isWritePending || isConfirming
                                ? 'Approving...'
                                : `Approve ${pool.collateralTokenSymbol}`}
                        </Button>
                    ) : (
                        <Button
                            className='w-full'
                            size='lg'
                            onClick={handleOpenPosition}
                            disabled={
                                !collateralAmount ||
                                isExceedingBalance() ||
                                isWritePending ||
                                isConfirming ||
                                Number(collateralAmount) <= 0
                            }
                        >
                            {isWritePending || isConfirming
                                ? 'Creating Position...'
                                : 'Create Position'}
                        </Button>
                    )}
                </div>
            </div>
        </main>
    );
}
