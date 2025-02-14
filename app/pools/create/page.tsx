'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/shared/Button';
import { ArrowLeft } from 'lucide-react';
import { useLendingPoolFactory } from '@/hooks/useLendingPoolFactory';
import { Address, Hash } from 'viem';
import { toast } from 'sonner';
import { useConfig } from 'wagmi';
import { getPublicClient } from '@wagmi/core';

export default function CreatePoolPage() {
    const router = useRouter();
    const config = useConfig();
    const { createLendingPool } = useLendingPoolFactory();

    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({
        loanToken: '',
        collateralToken: '',
        loanTokenUsdDataFeed: '',
        collateralTokenUsdDataFeed: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsCreating(true);

            // Validate addresses
            if (!formData.loanToken.startsWith('0x') ||
                !formData.collateralToken.startsWith('0x') ||
                !formData.loanTokenUsdDataFeed.startsWith('0x') ||
                !formData.collateralTokenUsdDataFeed.startsWith('0x')) {
                toast.error('Please enter valid addresses');
                return;
            }

            const result = await createLendingPool({
                loanToken: formData.loanToken as Address,
                collateralToken: formData.collateralToken as Address,
                loanTokenUsdDataFeed: formData.loanTokenUsdDataFeed as Address,
                collateralTokenUsdDataFeed: formData.collateralTokenUsdDataFeed as Address,
            });

            if (result) {
                toast.loading('Creating pool...');
                const publicClient = getPublicClient(config);

                if (publicClient) {
                    const receipt = await publicClient.waitForTransactionReceipt({
                        hash: result as Hash
                    });

                    if (receipt.status === 'success') {
                        toast.success('Pool created successfully!');
                        // Only redirect after successful transaction confirmation
                        setTimeout(() => {
                            router.push('/pools');
                            router.refresh(); // Refresh the pools page data
                        }, 1000); // Small delay to ensure the success message is seen
                    } else {
                        throw new Error('Transaction failed');
                    }
                }
            }
        } catch (error) {
            console.error('Error creating pool:', error);
            toast.error('Failed to create pool');
        } finally {
            setIsCreating(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <main className="container mx-auto px-4 py-8">
            <Button
                variant="ghost"
                className="mb-6"
                onClick={() => router.back()}
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
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Chainlink price feed address for the collateral token
                                </p>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            disabled={isCreating}
                        >
                            {isCreating ? 'Creating Pool...' : 'Create Pool'}
                        </Button>
                    </form>
                </div>
            </div>
        </main>
    );
}