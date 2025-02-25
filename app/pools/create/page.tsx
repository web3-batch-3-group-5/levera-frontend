'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/shared/Button';
import { ArrowLeft } from 'lucide-react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Address, parseUnits } from 'viem';
import { toast } from 'sonner';
import { CONTRACTS, PositionType } from '@/config/contracts';

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
    interestRate: '500', // Default 5%, represented as 500 basis points
    positionType: PositionType.LONG, // Default to LONG position
};

export default function CreatePoolPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);

    // Contract write setup
    const { writeContract, isPending } = useWriteContract();

    // Transaction confirmation
    const { isLoading: isConfirming, data: receipt } = useWaitForTransactionReceipt({
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submitted', formData);

        if (!validateAddresses(formData)) {
            return;
        }

        try {
            toast.loading('Please confirm the transaction in your wallet...', {
                id: 'wallet-confirm'
            });

            const liquidationThreshold = parseUnits(formData.liquidationThresholdPercentage, 0);
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
                        toast.loading('Transaction submitted, waiting for confirmation...', {
                            id: 'tx-confirm'
                        });
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

                if (errorMessage.toLowerCase().includes('rejected') ||
                    errorMessage.toLowerCase().includes('denied') ||
                    errorMessage.toLowerCase().includes('cancelled')) {
                    toast.error('Transaction rejected in wallet');
                } else {
                    toast.error(`Failed to create pool: ${errorMessage}`);
                }
            } else {
                toast.error('Failed to create pool: Unknown error');
            }
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const getButtonText = () => {
        if (isPending) return 'Confirm in Wallet...';
        if (isConfirming) return 'Creating Pool...';
        return 'Create Pool';
    };

    return (
        <main className="container mx-auto px-4 py-8">
            <Button
                variant="ghost"
                className="mb-6"
                onClick={() => router.back()}
                disabled={isPending || isConfirming}
            >
                <ArrowLeft className="size-4 mr-2" />
                Back to Pools
            </Button>

            <div className="max-w-2xl mx-auto">
                <div className="bg-card rounded-lg border p-6 space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">Create New Pool</h1>
                        <p className="text-sm text-muted-foreground">
                            Create a new lending pool by providing token and price feed addresses
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Loan Token Address
                                </label>
                                <input
                                    type="text"
                                    name="loanToken"
                                    value={formData.loanToken}
                                    onChange={handleInputChange}
                                    placeholder="0x..."
                                    className="w-full px-4 py-2 bg-background border rounded-md"
                                    required
                                    disabled={isPending || isConfirming}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    The token that will be supplied and borrowed
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Collateral Token Address
                                </label>
                                <input
                                    type="text"
                                    name="collateralToken"
                                    value={formData.collateralToken}
                                    onChange={handleInputChange}
                                    placeholder="0x..."
                                    className="w-full px-4 py-2 bg-background border rounded-md"
                                    required
                                    disabled={isPending || isConfirming}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    The token that will be used as collateral
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Loan Token Price Feed
                                </label>
                                <input
                                    type="text"
                                    name="loanTokenUsdDataFeed"
                                    value={formData.loanTokenUsdDataFeed}
                                    onChange={handleInputChange}
                                    placeholder="0x..."
                                    className="w-full px-4 py-2 bg-background border rounded-md"
                                    required
                                    disabled={isPending || isConfirming}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Chainlink price feed address for the loan token
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Collateral Token Price Feed
                                </label>
                                <input
                                    type="text"
                                    name="collateralTokenUsdDataFeed"
                                    value={formData.collateralTokenUsdDataFeed}
                                    onChange={handleInputChange}
                                    placeholder="0x..."
                                    className="w-full px-4 py-2 bg-background border rounded-md"
                                    required
                                    disabled={isPending || isConfirming}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Chainlink price feed address for the collateral token
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Liquidation Threshold (%)
                                </label>
                                <input
                                    type="number"
                                    name="liquidationThresholdPercentage"
                                    value={formData.liquidationThresholdPercentage}
                                    onChange={handleInputChange}
                                    min="1"
                                    max="100"
                                    placeholder="80"
                                    className="w-full px-4 py-2 bg-background border rounded-md"
                                    required
                                    disabled={isPending || isConfirming}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    The percentage threshold for liquidation (e.g., 80 means 0.8 or 80%)
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Interest Rate (basis points)
                                </label>
                                <input
                                    type="number"
                                    name="interestRate"
                                    value={formData.interestRate}
                                    onChange={handleInputChange}
                                    min="0"
                                    max="10000"
                                    placeholder="500"
                                    className="w-full px-4 py-2 bg-background border rounded-md"
                                    required
                                    disabled={isPending || isConfirming}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    The interest rate in basis points (e.g., 500 means 5%)
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Position Type
                                </label>
                                <select
                                    name="positionType"
                                    value={formData.positionType}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-background border rounded-md"
                                    required
                                    disabled={isPending || isConfirming}
                                >
                                    <option value={PositionType.LONG}>Long</option>
                                    <option value={PositionType.SHORT}>Short</option>
                                </select>
                                <p className="text-xs text-muted-foreground mt-1">
                                    The type of position this pool supports
                                </p>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            disabled={isPending || isConfirming}
                        >
                            {getButtonText()}
                        </Button>
                    </form>
                </div>
            </div>
        </main>
    );
}