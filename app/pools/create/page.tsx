'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/shared/Button';
import { ArrowLeft, Info, Percent, AlertTriangle } from 'lucide-react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Address, parseUnits } from 'viem';
import { toast } from 'sonner';
import { CONTRACTS } from '@/config/contracts';
import { PositionType } from '@/lib/types/contracts';

interface FormData {
    loanToken: string;
    collateralToken: string;
    loanTokenUsdDataFeed: string;
    collateralTokenUsdDataFeed: string;
    liquidationThresholdPercentage: string;
    interestRate: string;
    positionType: PositionType;
}

const initialFormData: FormData = {
    loanToken: '',
    collateralToken: '',
    loanTokenUsdDataFeed: '',
    collateralTokenUsdDataFeed: '',
    liquidationThresholdPercentage: '80', // Default 80%, representing 0.8
    interestRate: '10', // Default 10%
    positionType: PositionType.LONG, // Default to LONG position
};

export default function CreatePoolPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);

    // Contract write setup
    const { writeContract, isPending } = useWriteContract();

    // Transaction confirmation
    const { isLoading: isConfirming, data: receipt } =
        useWaitForTransactionReceipt({
            hash: txHash,
        });

    // Watch for receipt and handle completion
    useEffect(() => {
        if (receipt?.status === 'success') {
            toast.dismiss('tx-confirm');
            toast.success('Pool created successfully!');
            router.push('/pools');
        }
    }, [receipt, router]);

    const validateAddresses = (data: FormData): boolean => {
        const isValidAddress = (address: string) =>
            address.startsWith('0x') && address.length === 42;

        if (!isValidAddress(data.loanToken)) {
            toast.error('Invalid loan token address');
            return false;
        }
        if (!isValidAddress(data.collateralToken)) {
            toast.error('Invalid collateral token address');
            return false;
        }
        if (!isValidAddress(data.loanTokenUsdDataFeed)) {
            toast.error('Invalid loan token price feed address');
            return false;
        }
        if (!isValidAddress(data.collateralTokenUsdDataFeed)) {
            toast.error('Invalid collateral token price feed address');
            return false;
        }
        return true;
    };

    const validatePercentages = (data: FormData): boolean => {
        const liquidationThreshold = Number(
            data.liquidationThresholdPercentage
        );
        const interestRate = Number(data.interestRate);

        if (liquidationThreshold < 0 || liquidationThreshold > 100) {
            toast.error('Liquidation threshold must be between 0 and 100');
            return false;
        }

        if (interestRate < 0 || interestRate > 100) {
            toast.error('Interest rate must be between 0 and 100');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submitted', formData);

        if (!validateAddresses(formData) || !validatePercentages(formData)) {
            return;
        }

        try {
            toast.loading('Please confirm the transaction in your wallet...', {
                id: 'wallet-confirm',
            });

            // Convert percentages to contract format
            // 80% => 80 (since contract expects 0-100)
            const liquidationThreshold = parseUnits(
                formData.liquidationThresholdPercentage,
                0
            );
            const interestRate = parseUnits(formData.interestRate, 0);

            writeContract(
                {
                    address: CONTRACTS.LENDING_POOL_FACTORY.address,
                    abi: CONTRACTS.LENDING_POOL_FACTORY.abi,
                    functionName: 'createLendingPool',
                    args: [
                        formData.loanToken as Address,
                        formData.collateralToken as Address,
                        formData.loanTokenUsdDataFeed as Address,
                        formData.collateralTokenUsdDataFeed as Address,
                        liquidationThreshold,
                        interestRate,
                        formData.positionType,
                    ],
                },
                {
                    onSuccess: (hash) => {
                        console.log('Transaction Hash:', hash);
                        setTxHash(hash);
                        toast.dismiss('wallet-confirm');
                        toast.loading(
                            'Transaction submitted, waiting for confirmation...',
                            {
                                id: 'tx-confirm',
                            }
                        );
                    },
                    onError: (error) => {
                        console.error('Transaction Error:', error);
                        toast.dismiss('wallet-confirm');
                        toast.error('Failed to create pool: ' + error.message);
                    },
                }
            );
        } catch (error: unknown) {
            console.error('Error details:', error);
            toast.dismiss('wallet-confirm');

            if (error && typeof error === 'object' && 'message' in error) {
                const errorMessage = error.message as string;

                if (
                    errorMessage.toLowerCase().includes('rejected') ||
                    errorMessage.toLowerCase().includes('denied') ||
                    errorMessage.toLowerCase().includes('cancelled')
                ) {
                    toast.error('Transaction rejected in wallet');
                } else {
                    toast.error(`Failed to create pool: ${errorMessage}`);
                }
            } else {
                toast.error('Failed to create pool: Unknown error');
            }
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const getButtonText = () => {
        if (isPending) return 'Confirm in Wallet...';
        if (isConfirming) return 'Creating Pool...';
        return 'Create Pool';
    };

    return (
        <main className='container mx-auto px-4 py-8'>
            <Button
                variant='ghost'
                className='mb-6'
                onClick={() => router.back()}
                disabled={isPending || isConfirming}
            >
                <ArrowLeft className='size-4 mr-2' />
                Back to Pools
            </Button>

            <div className='max-w-2xl mx-auto'>
                <div className='bg-card rounded-lg border p-6 space-y-6'>
                    <div>
                        <h1 className='text-2xl font-bold mb-2'>
                            Create New Pool
                        </h1>
                        <p className='text-sm text-muted-foreground'>
                            Create a new lending pool by providing token and
                            price feed addresses
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className='space-y-6'>
                        <div className='space-y-4'>
                            <div>
                                <label className='block text-sm font-medium mb-2'>
                                    Loan Token Address
                                </label>
                                <input
                                    type='text'
                                    name='loanToken'
                                    value={formData.loanToken}
                                    onChange={handleInputChange}
                                    placeholder='0x...'
                                    className='w-full px-4 py-2 bg-background border rounded-md'
                                    required
                                    disabled={isPending || isConfirming}
                                />
                                <p className='text-xs text-muted-foreground mt-1'>
                                    The token that will be supplied and borrowed
                                </p>
                            </div>

                            <div>
                                <label className='block text-sm font-medium mb-2'>
                                    Collateral Token Address
                                </label>
                                <input
                                    type='text'
                                    name='collateralToken'
                                    value={formData.collateralToken}
                                    onChange={handleInputChange}
                                    placeholder='0x...'
                                    className='w-full px-4 py-2 bg-background border rounded-md'
                                    required
                                    disabled={isPending || isConfirming}
                                />
                                <p className='text-xs text-muted-foreground mt-1'>
                                    The token that will be used as collateral
                                </p>
                            </div>

                            <div>
                                <div className='flex justify-between items-center mb-2'>
                                    <label className='block text-sm font-medium'>
                                        Liquidation Threshold (%)
                                    </label>
                                    <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                                        <span>
                                            {
                                                formData.liquidationThresholdPercentage
                                            }
                                            %
                                        </span>
                                    </div>
                                </div>
                                <input
                                    type='range'
                                    name='liquidationThresholdPercentage'
                                    value={
                                        formData.liquidationThresholdPercentage
                                    }
                                    onChange={handleInputChange}
                                    min='1'
                                    max='100'
                                    step='1'
                                    className='w-full'
                                    disabled={isPending || isConfirming}
                                />
                                <div className='flex justify-between text-xs text-muted-foreground mt-1'>
                                    <span>0%</span>
                                    <span>50%</span>
                                    <span>100%</span>
                                </div>
                                <p className='text-xs text-muted-foreground mt-2 flex items-center gap-1'>
                                    <Info className='size-3' />
                                    The percentage threshold for liquidation
                                    (e.g., 80 means 0.8 or 80%)
                                </p>
                            </div>

                            <div>
                                <div className='flex justify-between items-center mb-2'>
                                    <label className='block text-sm font-medium'>
                                        Interest Rate (%)
                                    </label>
                                    <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                                        <span>{formData.interestRate}%</span>
                                    </div>
                                </div>
                                <input
                                    type='range'
                                    name='interestRate'
                                    value={formData.interestRate}
                                    onChange={handleInputChange}
                                    min='0'
                                    max='100'
                                    step='1'
                                    className='w-full'
                                    disabled={isPending || isConfirming}
                                />
                                <div className='flex justify-between text-xs text-muted-foreground mt-1'>
                                    <span>0%</span>
                                    <span>50%</span>
                                    <span>100%</span>
                                </div>
                                <p className='text-xs text-muted-foreground mt-2 flex items-center gap-1'>
                                    <Info className='size-3' />
                                    The interest rate percentage (e.g., 10 means
                                    10%)
                                </p>
                            </div>

                            <div>
                                <label className='block text-sm font-medium mb-2'>
                                    Liquidation Threshold (%)
                                </label>
                                <input
                                    type='number'
                                    name='liquidationThresholdPercentage'
                                    value={
                                        formData.liquidationThresholdPercentage
                                    }
                                    onChange={handleInputChange}
                                    min='1'
                                    max='100'
                                    placeholder='80'
                                    className='w-full px-4 py-2 bg-background border rounded-md'
                                    required
                                    disabled={isPending || isConfirming}
                                />
                                <p className='text-xs text-muted-foreground mt-1'>
                                    The percentage threshold for liquidation
                                    (e.g., 80 means 0.8 or 80%)
                                </p>
                            </div>

                            {/* Additional info box */}
                            <div className='bg-muted/50 rounded-lg p-4 space-y-2 text-sm'>
                                <div className='flex items-start gap-2'>
                                    <AlertTriangle className='size-4 text-amber-500 flex-shrink-0 mt-0.5' />
                                    <div>
                                        <p className='font-medium mb-1'>
                                            Important Information
                                        </p>
                                        <p className='text-muted-foreground text-xs'>
                                            Make sure you've verified the token
                                            addresses and price feeds. Once
                                            created, pool parameters cannot be
                                            changed.
                                        </p>
                                    </div>
                                </div>

                                {txHash && (
                                    <div className='pt-2 mt-2 border-t border-border'>
                                        <p className='text-xs text-muted-foreground'>
                                            Transaction Hash:
                                        </p>
                                        <p className='font-mono text-xs break-all'>
                                            {txHash}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <Button
                                type='submit'
                                className='w-full'
                                size='lg'
                                disabled={isPending || isConfirming}
                            >
                                {getButtonText()}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}
