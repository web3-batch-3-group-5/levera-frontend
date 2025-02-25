'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Address, parseUnits, formatUnits, zeroAddress } from 'viem';
import { useAccount } from 'wagmi';
import { Button } from '@/components/shared/Button';
import { ArrowLeft } from 'lucide-react';
import { useLendingPool } from '@/hooks/useLendingPool';
import { useLendingPoolFactory } from '@/hooks/useLendingPoolFactory';
import { usePositionFactory } from '@/hooks/usePositionFactory';
import { formatTokenAmount } from '@/lib/utils';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { erc20Abi } from 'viem';
import { toast } from 'sonner';
import { getConversionRate } from '@/lib/convertPrice';
import { LiquidationCalculator } from '@/lib/health';

export default function MarginTradePage() {
    const router = useRouter();
    const params = useParams();
    const poolAddress = params.address as Address;
    const { address: userAddress } = useAccount();

    // State management
    const [collateralAmount, setCollateralAmount] = useState('');
    const [leverage, setLeverage] = useState(1.5);
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
    const [hasApproved, setHasApproved] = useState(false);
    const [liquidationPrice, setLiquidationPrice] = useState<number | null>(null);
    const [healthFactor, setHealthFactor] = useState<number | null>(null);
    const [ltv, setLtv] = useState<number | null>(null);
    const [borrowAmount, setLiquidationBorrowAmount] = useState<number | null>(null);

    // Get pool data
    const { poolAddresses, pools } = useLendingPoolFactory();
    const poolIndex = poolAddresses.findIndex(addr => addr.toLowerCase() === poolAddress.toLowerCase());
    const pool = poolIndex !== -1 ? pools[poolIndex] : undefined;
    
    const {
        totalSupplyAssets,
        interestRate,
        ltp,
    } = useLendingPool(poolAddress);
    const calculator = new LiquidationCalculator(BigInt(80));

    
    useEffect(() => {
        let isMounted = true; 
        const calculate = async () => {        
            try {
                const effectiveCollateral: number = Number(collateralAmount) * leverage;
                const borrowAmount = await getConversionRate(
                    (Number(collateralAmount) * (leverage - 1)), 
                    "0x694AA1769357215DE4FAC081bf1f309aDC325306", 
                    "0xAb5c49580294Aff77670F839ea425f5b78ab3Ae7"
                );
                const effectiveCollateralPrice: number = await getConversionRate(
                    effectiveCollateral,
                    "0x694AA1769357215DE4FAC081bf1f309aDC325306",
                    "0xAb5c49580294Aff77670F839ea425f5b78ab3Ae7"
                );

                const [liqPrice, health, ltvRatio] = await Promise.all([
                    calculator.getLiquidationPrice(effectiveCollateral, Number(borrowAmount)),
                    calculator.getHealth(effectiveCollateralPrice, Number(borrowAmount)),
                    calculator.getLTV(effectiveCollateralPrice,  Number(borrowAmount)),
                ]);

                setLiquidationBorrowAmount(borrowAmount);
                setLiquidationPrice(liqPrice);
                setHealthFactor(health);
                setLtv(ltvRatio);
            } catch (error) {
                console.error("Error calculating values:", error);
            }
        };
    
        calculate();
        return () => {
            isMounted = false;
        };
    }, [collateralAmount, leverage]);
    
    // Position factory access
    const { createPosition, isCreatingPosition } = usePositionFactory();
    const { writeContract } = useWriteContract();

    // Transaction confirmation
    const { isLoading: isConfirming, data: receipt } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    // Get token balances and approvals
    const { data: walletBalance } = useReadContract({
        address: pool?.collateralToken,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [userAddress || zeroAddress],
    });

    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: pool?.collateralToken,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [userAddress || zeroAddress, poolAddress],
    });

    // Check if approval is needed
    useEffect(() => {
        if (!collateralAmount || !allowance) return;

        try {
            const amount = parseUnits(collateralAmount, 18);
            setHasApproved(allowance >= amount);
        } catch (error) {
            console.error('Error checking allowance:', error);
        }
    }, [collateralAmount, allowance]);

    // Watch for transaction completion
    useEffect(() => {
        if (receipt?.status === 'success') {
            toast.dismiss('tx-confirm');
            toast.success('Position created successfully!');
            router.push(`/margin/${poolAddress}`);
        }
    }, [receipt, router, poolAddress]);

    // Calculate position details
    const calculatePositionDetails = () => {
        if (!collateralAmount || !leverage) {
            return {
                borrowAmount: 0n,
                liquidationPrice: 0,
                healthFactor: 1.0,
                loanToValue: 0.33,
            };
        }

        try {
            const collateralValue = parseFloat(collateralAmount);
            const borrowAmount = collateralValue * (leverage - 1);

            // These calculations are simplified and should be adjusted based on your protocol logic
            // const healthFactor = ltp ? Number(ltp) / 100 / (leverage - 1) : 1.0;
            // const loanToValue = (leverage - 1) / leverage;

            // For liquidation price, you should use your contract's formula
            // This is a placeholder calculation
            // const liquidationPrice = ltp ? collateralValue * Number(ltp) / 100 : 0.0;

            return {
                borrowAmount: parseUnits(borrowAmount.toFixed(18), 18),
                liquidationPrice: liquidationPrice ? liquidationPrice.toFixed(4) : "0.0000",
                healthFactor: Number(healthFactor?.toFixed(2)) || 0,
                loanToValue: Number(ltv?.toFixed(4)) || 0,
            };
            
        } catch (error) {
            console.error('Error calculating position details:', error);
            return {
                borrowAmount: 0n,
                liquidationPrice: 0,
                healthFactor: 1.0,
                loanToValue: 0.33,
            };
        }
    };

    const positionDetails = calculatePositionDetails();

    // Handle percentage buttons
    const handlePercentageClick = (percentage: number) => {
        if (!walletBalance) return;
        const amount = (Number(formatUnits(walletBalance, 18)) * percentage) / 100;
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
    const handleApproveCollateral = async () => {
        if (!collateralAmount || !pool || !userAddress) return;

        try {
            const amount = parseUnits(collateralAmount, 18);

            const hash = await writeContract({
                address: pool.collateralToken,
                abi: erc20Abi,
                functionName: 'approve',
                args: [poolAddress, amount],
            });

            toast.success('Approval transaction submitted');
            setTxHash(hash);

            // We'll handle the approval status in the useEffect that watches for receipt
        } catch (error) {
            console.error('Error approving collateral:', error);
            toast.error('Failed to approve collateral');
        }
    };

    // Open position
    const handleOpenPosition = async () => {
        if (!collateralAmount || !pool || !userAddress) return;

        try {
            const collateralAmountBigInt = parseUnits(collateralAmount, 18);

            toast.loading('Creating position...', { id: 'create-position' });

            const hash = await createPosition(
                poolAddress,
                collateralAmountBigInt,
                leverage
            );

            toast.dismiss('create-position');
            toast.loading('Transaction submitted, waiting for confirmation...', { id: 'tx-confirm' });
            setTxHash(hash);
        } catch (error) {
            console.error('Error creating position:', error);
            toast.dismiss('create-position');
            toast.error('Failed to create position');
        }
    };

    return (
        <main className="container mx-auto px-4 py-8">
            <Button
                variant="ghost"
                className="mb-6"
                onClick={() => router.back()}
            >
                <ArrowLeft className="size-4 mr-2" />
                Back
            </Button>

            <div className="max-w-xl mx-auto">
                <div className="bg-card rounded-lg border p-6 space-y-6">
                    {/* Deposit Section */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-medium">Deposit</h2>
                            <div className="text-sm text-muted-foreground">
                                Wallet Balance: {formatTokenAmount(walletBalance)} {pool?.collateralTokenSymbol}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="font-medium">{pool?.collateralTokenSymbol}</span>
                        </div>

                        <div className="space-y-2">
                            <input
                                type="number"
                                value={collateralAmount}
                                onChange={(e) => setCollateralAmount(e.target.value)}
                                className="w-full bg-background p-2 rounded border"
                                placeholder="0.00"
                            />
                            {isExceedingBalance() && (
                                <p className="text-red-500">Amount input exceed balance</p>
                            )}
                            <div className="flex gap-2">
                                {[25, 50, 75, 100].map((percentage) => (
                                    <Button
                                        key={percentage}
                                        variant="secondary"
                                        onClick={() => handlePercentageClick(percentage)}
                                        className="flex-1"
                                    >
                                        {percentage}%
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Leverage Section */}
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span>Leverage Multiplier</span>
                            <span>{leverage.toFixed(2)}x</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="3"
                            step="0.1"
                            value={leverage}
                            onChange={(e) => setLeverage(parseFloat(e.target.value))}
                            className="w-full"
                        />
                    </div>

                    {/* Borrow Amount Section */}
                    <div className="space-y-4">
                        <h3 className="font-medium">Estimated Borrow Amount</h3>
                        <div className="flex items-center gap-2">
                            <span className="font-medium">{pool?.loanTokenSymbol}</span>
                        </div>
                        <input
                            type="text"
                            value={formatUnits(positionDetails.borrowAmount, 18)}
                            readOnly
                            className="w-full bg-background p-2 rounded border"
                        />
                    </div>

                    {/* Position Metrics */}
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Liquidation Threshold</span>
                            <span>{ltp ? (Number(ltp) / 100).toFixed(2) : '0.80'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Liquidation Price</span>
                            <span>${positionDetails.liquidationPrice}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Health Factor</span>
                            <span>{positionDetails.healthFactor}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Loan to Value (LTV)</span>
                            <span>{positionDetails.loanToValue}</span>
                        </div>
                    </div>

                    {!hasApproved ? (
                        <Button
                            className="w-full"
                            size="lg"
                            onClick={handleApproveCollateral}
                            disabled={!collateralAmount || isExceedingBalance() || isConfirming}
                        >
                            {isConfirming ? 'Approving...' : 'Approve Collateral'}
                        </Button>
                    ) : (
                        <Button
                            className="w-full"
                            size="lg"
                            onClick={handleOpenPosition}
                            disabled={!collateralAmount || isExceedingBalance() || isCreatingPosition || isConfirming}
                        >
                            {isCreatingPosition || isConfirming ? 'Creating Position...' : 'Open Position'}
                        </Button>
                    )}
                </div>
            </div>
        </main>
    );
}