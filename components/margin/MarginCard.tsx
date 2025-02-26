import { useState } from 'react';
import { Address } from 'viem';
import { useRouter } from 'next/navigation';
import { usePosition } from '@/hooks/usePosition';
import { Button } from '@/components/shared/Button';
import { formatTokenAmount } from '@/lib/utils/format';
import { Activity, TrendingUp, AlertCircle, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

interface MarginCardProps {
    positionAddress: Address;
    lendingPoolAddress: Address;
    loanTokenSymbol: string;
    collateralTokenSymbol: string;
}

export function MarginCard({
    positionAddress,
    lendingPoolAddress,
    loanTokenSymbol,
    collateralTokenSymbol,
}: MarginCardProps) {
    const router = useRouter();
    const [showDetails, setShowDetails] = useState(false);

    // Define additional state for loading and error handling
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const {
        baseCollateral,
        effectiveCollateral,
        borrowShares,
        leverage,
        liquidationPrice,
        health,
        ltv,
    } = usePosition(positionAddress);

    // Calculate net value (estimated USD value)
    const netValue = effectiveCollateral ? Number(effectiveCollateral) * 1.2 : 0; // Using a placeholder price multiplier

    // Determine health status color and label
    let healthColor = 'text-green-500';
    let healthStatus = 'Healthy';

    if (health) {
        const healthValue = Number(health) / 100; // Convert from basis points if needed
        if (healthValue < 1.1) {
            healthColor = 'text-red-500';
            healthStatus = 'At Risk';
        } else if (healthValue < 1.3) {
            healthColor = 'text-yellow-500';
            healthStatus = 'Caution';
        }
    }

    // Navigate to detailed view
    const handleViewDetails = () => {
        router.push(`/margin/${lendingPoolAddress}/${positionAddress}`);
    };

    // Action handlers
    const handleAddCollateral = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.push(`/margin/${lendingPoolAddress}/${positionAddress}/add-collateral`);
    };

    const handleAdjustLeverage = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.push(`/margin/${lendingPoolAddress}/${positionAddress}/adjust-leverage`);
    };

    const handleClosePosition = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.push(`/margin/${lendingPoolAddress}/${positionAddress}/close`);
    };

    // Toggle expanded view
    const toggleDetails = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowDetails(!showDetails);
    };

    // Handle loading state
    if (isLoading) {
        return (
            <div className="border rounded-lg p-4 bg-card animate-pulse">
                <div className="h-6 w-1/3 bg-muted rounded mb-4"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="space-y-2">
                        <div className="h-4 w-16 bg-muted rounded"></div>
                        <div className="h-5 w-20 bg-muted rounded"></div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 w-16 bg-muted rounded"></div>
                        <div className="h-5 w-20 bg-muted rounded"></div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 w-16 bg-muted rounded"></div>
                        <div className="h-5 w-20 bg-muted rounded"></div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 w-16 bg-muted rounded"></div>
                        <div className="h-5 w-20 bg-muted rounded"></div>
                    </div>
                </div>
                <div className="h-9 w-full bg-muted rounded"></div>
            </div>
        );
    }

    // Handle error state
    if (error) {
        return (
            <div className="border rounded-lg p-4 bg-card">
                <div className="flex items-center gap-2 text-destructive mb-4">
                    <AlertCircle className="size-5" />
                    <span>Error loading position data</span>
                </div>
                <div className="flex justify-end">
                    <Button size="sm" onClick={handleViewDetails}>View Details</Button>
                </div>
            </div>
        );
    }

    return (
        <div 
            className="border rounded-lg bg-card overflow-hidden hover:shadow-md transition-shadow cursor-pointer" 
            onClick={handleViewDetails}
        >
            <div className="p-4">
                {/* Position Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-green-500"></div>
                        <span className="font-medium">{loanTokenSymbol}/{collateralTokenSymbol}</span>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs ${healthColor} bg-opacity-20 flex items-center gap-1`}>
                        <span className={`size-1.5 rounded-full ${healthColor.replace('text', 'bg')}`}></span>
                        {healthStatus}
                    </div>
                </div>

                {/* Position Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Net Value</p>
                        <p className="font-medium">${formatTokenAmount(BigInt(Math.floor(netValue)), { decimals: 2 })}</p>
                    </div>

                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Activity className="size-3" />
                            Liquidation Price
                        </p>
                        <p className="font-medium">${formatTokenAmount(liquidationPrice || 0n, { decimals: 4 })}</p>
                    </div>

                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <AlertCircle className="size-3" />
                            Health
                        </p>
                        <p className={`font-medium ${healthColor}`}>
                            {health ? (Number(health) / 100).toFixed(2) : '0.00'}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <TrendingUp className="size-3" />
                            Leverage
                        </p>
                        <p className="font-medium">
                            {leverage ? (Number(leverage) / 100).toFixed(2) : '1.00'}x
                        </p>
                    </div>
                </div>

                {/* Expanded Details (conditional) */}
                {showDetails && (
                    <div className="border-t pt-4 mb-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Base Collateral</p>
                            <p className="font-medium">
                                {formatTokenAmount(baseCollateral || 0n)} {collateralTokenSymbol}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Effective Collateral</p>
                            <p className="font-medium">
                                {formatTokenAmount(effectiveCollateral || 0n)} {collateralTokenSymbol}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Borrowed Amount</p>
                            <p className="font-medium">
                                {formatTokenAmount(borrowShares || 0n)} {loanTokenSymbol}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">LTV</p>
                            <p className="font-medium">
                                {ltv ? (Number(ltv) / 10000).toFixed(2) : '0.00'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleDetails}
                        className="text-xs text-muted-foreground hover:text-foreground"
                    >
                        {showDetails ? 'Show less' : 'Show more'}
                    </Button>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            onClick={handleAddCollateral}
                        >
                            <ArrowDownCircle className="size-3.5" />
                            <span className="hidden sm:inline">Add</span>
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            onClick={handleAdjustLeverage}
                        >
                            <TrendingUp className="size-3.5" />
                            <span className="hidden sm:inline">Adjust</span>
                        </Button>

                        <Button
                            variant="secondary"
                            size="sm"
                            className="gap-1"
                            onClick={handleClosePosition}
                        >
                            <ArrowUpCircle className="size-3.5" />
                            <span className="hidden sm:inline">Close</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}