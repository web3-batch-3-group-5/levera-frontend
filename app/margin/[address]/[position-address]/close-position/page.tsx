'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Address } from 'viem';
import { useAccount } from 'wagmi';
import { Button } from '@/components/shared/Button';
import {
    ArrowLeft,
    Info,
    AlertTriangle,
    ExternalLink,
    ArrowUpCircle,
} from 'lucide-react';
import { usePosition } from '@/hooks/usePosition';
import { useLendingPool } from '@/hooks/useLendingPool';
import { useLendingPoolFactory } from '@/hooks/useLendingPoolFactory';
import { usePositionFactory } from '@/hooks/usePositionFactory';
import { formatTokenAmount } from '@/lib/utils/format';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { toast } from 'sonner';
import { formatAddress } from '@/lib/utils';
import { positionABI } from '@/lib/abis/position';

export default function ClosePositionPage() {
    const router = useRouter();
    const params = useParams();
    const poolAddress = params.address as Address;
    const positionAddress = params.positionAddress as Address;
    const { address: userAddress } = useAccount();

    // State management
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
    const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);

    // Get pool data
    const { poolAddresses, pools } = useLendingPoolFactory();
    const poolIndex = poolAddresses.findIndex(
        (addr) => addr.toLowerCase() === poolAddress.toLowerCase()
    );
    const pool = poolIndex !== -1 ? pools[poolIndex] : undefined;

    // Get position data
    const {
        baseCollateral,
        effectiveCollateral,
        borrowShares,
        leverage,
        liquidationPrice,
        health,
        ltv,
        closePosition: closePositionFunc,
        isLoading: isLoadingPosition,
        error: positionError,
    } = usePosition(positionAddress);

    // Get lending pool data
    const { ltp } = useLendingPool(poolAddress);

    // Get position factory for deleting position
    const { deletePosition } = usePositionFactory();

    // Contract functions
    const { writeContract, isPending: isWritePending } = useWriteContract();

    // Transaction confirmation
    const { isLoading: isConfirming, data: receipt } =
        useWaitForTransactionReceipt({
            hash: txHash,
        });

    // Watch for transaction completion
    useEffect(() => {
        if (receipt?.status === 'success') {
            toast.dismiss('tx-confirm');
            toast.success('Position closed successfully!');
            router.push('/margin');
        }
    }, [receipt, router]);

    // Handle Close Position
    const handleClosePosition = async () => {
        try {
            toast.loading('Closing position...', { id: 'close-position' });

            // Use position close function
            writeContract(
                {
                    address: positionAddress,
                    abi: positionABI,
                    functionName: 'closePosition',
                    args: [],
                },
                {
                    onSuccess: (hash) => {
                        setTxHash(hash);
                        toast.dismiss('close-position');
                        toast.loading(
                            'Transaction submitted, waiting for confirmation...',
                            { id: 'tx-confirm' }
                        );
                    },
                    onError: (error) => {
                        console.error('Close position error:', error);
                        toast.dismiss('close-position');
                        toast.error(
                            'Failed to close position: ' + error.message
                        );
                    },
                }
            );
        } catch (error) {
            console.error('Error closing position:', error);
            toast.dismiss('close-position');
            toast.error('Failed to close position');
        }
    };

    // Alternative method to close via factory
    const handleDeletePosition = async () => {
        try {
            toast.loading('Closing position...', { id: 'close-position' });

            // Use factory delete method
            await deletePosition(poolAddress, userAddress as Address);

            toast.dismiss('close-position');
            toast.loading(
                'Transaction submitted, waiting for confirmation...',
                { id: 'tx-confirm' }
            );
        } catch (error) {
            console.error('Error deleting position:', error);
            toast.dismiss('close-position');
            toast.error('Failed to close position');
        }
    };

    // Action button state
    const isDisabled = isWritePending || isConfirming;
    const buttonLabel =
        isWritePending || isConfirming
            ? 'Closing Position...'
            : 'Close Position';

    if (!pool || (isLoadingPosition && !positionError)) {
        return (
            <div className='container mx-auto px-4 py-8'>
                <Button
                    variant='ghost'
                    className='mb-6'
                    onClick={() => router.back()}
                >
                    <ArrowLeft className='size-4 mr-2' />
                    Back
                </Button>

                <div className='max-w-xl mx-auto'>
                    <div className='bg-card rounded-lg border p-6'>
                        <div className='text-center py-8'>
                            <div className='size-8 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4'></div>
                            <p className='text-muted-foreground'>
                                Loading position data...
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (positionError) {
        return (
            <div className='container mx-auto px-4 py-8'>
                <Button
                    variant='ghost'
                    className='mb-6'
                    onClick={() => router.back()}
                >
                    <ArrowLeft className='size-4 mr-2' />
                    Back
                </Button>

                <div className='max-w-xl mx-auto'>
                    <div className='bg-card rounded-lg border p-6'>
                        <div className='text-center py-8'>
                            <AlertTriangle className='size-10 text-destructive mx-auto mb-4' />
                            <h3 className='text-xl font-bold mb-2'>
                                Error Loading Position
                            </h3>
                            <p className='text-muted-foreground mb-6'>
                                {positionError ||
                                    'Failed to load position data'}
                            </p>
                            <Button onClick={() => router.back()}>
                                Go Back
                            </Button>
                        </div>
                    </div>
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
                Back to Position
            </Button>

            <div className='max-w-xl mx-auto'>
                <div className='bg-card rounded-lg border p-6 space-y-6'>
                    <div className='text-center'>
                        <ArrowUpCircle className='size-12 text-primary mx-auto mb-4' />
                        <h1 className='text-xl font-bold mb-2'>
                            Close Position
                        </h1>
                        <p className='text-sm text-muted-foreground'>
                            You're about to close your {pool.loanTokenSymbol}/
                            {pool.collateralTokenSymbol} position
                        </p>
                    </div>

                    {/* Position Summary */}
                    <div className='bg-muted/50 rounded-lg p-4 space-y-3'>
                        <div className='flex justify-between'>
                            <span className='text-sm text-muted-foreground'>
                                Position
                            </span>
                            <span className='font-mono text-sm'>
                                {formatAddress(positionAddress)}
                            </span>
                        </div>
                        <div className='flex justify-between'>
                            <span className='text-sm text-muted-foreground'>
                                Base Collateral
                            </span>
                            <span>
                                {formatTokenAmount(baseCollateral || 0n)}{' '}
                                {pool.collateralTokenSymbol}
                            </span>
                        </div>
                        <div className='flex justify-between'>
                            <span className='text-sm text-muted-foreground'>
                                Effective Collateral
                            </span>
                            <span>
                                {formatTokenAmount(effectiveCollateral || 0n)}{' '}
                                {pool.collateralTokenSymbol}
                            </span>
                        </div>
                        <div className='flex justify-between'>
                            <span className='text-sm text-muted-foreground'>
                                Borrowed Amount
                            </span>
                            <span>
                                {formatTokenAmount(borrowShares || 0n)}{' '}
                                {pool.loanTokenSymbol}
                            </span>
                        </div>
                        <div className='flex justify-between'>
                            <span className='text-sm text-muted-foreground'>
                                Leverage
                            </span>
                            <span>{(Number(leverage) / 100).toFixed(2)}x</span>
                        </div>
                    </div>

                    {/* Information & Warning */}
                    <div className='bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4'>
                        <h3 className='font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2'>
                            <Info className='size-4' />
                            What happens when you close a position?
                        </h3>
                        <ul className='text-sm text-blue-700 dark:text-blue-400 space-y-2 list-disc pl-5'>
                            <li>Your borrowed funds will be repaid</li>
                            <li>
                                Your collateral will be returned to your wallet
                                (minus the borrowed amount)
                            </li>
                            <li>The position contract will be deactivated</li>
                            <li>Any accrued interest will be paid</li>
                        </ul>
                    </div>

                    {/* Confirmation Dialog (conditionally shown) */}
                    {isConfirmationVisible ? (
                        <div className='space-y-4'>
                            <div className='bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4'>
                                <p className='font-medium text-amber-800 dark:text-amber-300 mb-2'>
                                    Are you sure you want to close this
                                    position?
                                </p>
                                <p className='text-sm text-amber-700 dark:text-amber-400'>
                                    This action cannot be undone.
                                </p>
                            </div>

                            <div className='flex gap-3'>
                                <Button
                                    variant='destructive'
                                    className='flex-1'
                                    onClick={handleClosePosition}
                                    disabled={isDisabled}
                                >
                                    {buttonLabel}
                                </Button>
                                <Button
                                    variant='outline'
                                    className='flex-1'
                                    onClick={() =>
                                        setIsConfirmationVisible(false)
                                    }
                                    disabled={isDisabled}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Button
                            className='w-full'
                            size='lg'
                            variant='destructive'
                            onClick={() => setIsConfirmationVisible(true)}
                            disabled={isDisabled}
                        >
                            Close Position
                        </Button>
                    )}

                    {/* Transaction Hash (if submitted) */}
                    {txHash && (
                        <div className='flex items-center justify-between pt-2 text-sm text-muted-foreground'>
                            <span>Transaction:</span>
                            <a
                                href={`https://sepolia.arbiscan.io/tx/${txHash}`}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='flex items-center gap-1 text-primary hover:underline'
                            >
                                {formatAddress(txHash)}
                                <ExternalLink className='size-3.5' />
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
