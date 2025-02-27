import { useState } from 'react';
import { Address } from 'viem';
import { useRouter } from 'next/navigation';
import { usePosition } from '@/hooks/usePosition';
import { Button } from '@/components/shared/Button';
import { formatTokenAmount } from '@/lib/utils/format';
import { formatAddress } from '@/lib/utils';
import { Activity, TrendingUp, AlertCircle, ArrowDownCircle, ArrowUpCircle, Info, Scale } from 'lucide-react';

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
    const [isExpanded, setIsExpanded] = useState(false);

    // Get position data
    const {
        baseCollateral,
        effectiveCollateral,
        borrowShares,
        leverage,
        liquidationPrice,
        health,
        ltv,
        isLoading,
        error: positionError
    } = usePosition(positionAddress);

    // Calculate net value (estimated)
    const netValue = effectiveCollateral ? Number(effectiveCollateral) * 1.2 : 0; // Simple placeholder calculation

    // Determine health status color and label
    let healthColor = 'text-green-500';
    let healthStatus = 'Healthy';

    if (health) {
        const healthValue = Number(health) / 100; // Convert from basis points
        if (healthValue < 1.1) {
            healthColor = 'text-red-500';
            healthStatus = 'At Risk';
        } else if (healthValue < 1.3) {
            healthColor = 'text-yellow-500';
            healthStatus = 'Caution';
        }
    }

    // Navigate to detailed view
    const handleClick = () => {
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
    const handleToggleExpand = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    const StatusBadge = () => (
        <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
            healthColor.replace('text', 'bg')}-100 ${healthColor} dark:${healthColor.replace('text', 'bg')}-900/50`}>
            <span className={`size-1.5 rounded-full ${healthColor.replace('text', 'bg')}`}></span>
            {healthStatus}
        </div>
    );

    if (positionError) {
        return (
            <div className="bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-lg font-semibold">
                                {loanTokenSymbol}/{collateralTokenSymbol} Position
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Position ID: {formatAddress(positionAddress)}
                            </p>
                        </div>
                        <StatusBadge />
                    </div>

                    <div className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="size-4" />
                        <span className="text-sm">Error loading position data</span>
                    </div>

                    <Button
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/margin/${lendingPoolAddress}/${positionAddress}`);
                        }}
                        className="w-full"
                        variant="outline"
                    >
                        View Details
                    </Button>
                </div>
            </div>
        );
    }

    // Base content (shown in both collapsed and expanded views)
    const baseContent = (
        <>
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-lg font-semibold">
                        {loanTokenSymbol}/{collateralTokenSymbol} Position
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Position ID: {formatAddress(positionAddress)}
                    </p>
                </div>
                <StatusBadge />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Scale className="size-4" />
                        Net Value
                    </p>
                    {isLoading ? (
                        <div className="h-5 bg-muted/50 rounded w-24 animate-pulse"></div>
                    ) : (
                        <p className="font-medium">
                            ${formatTokenAmount(BigInt(Math.floor(netValue)), { decimals: 2 })}
                        </p>
                    )}
                </div>

                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Activity className="size-4" />
                        Liquidation Price
                    </p>
                    {isLoading ? (
                        <div className="h-5 bg-muted/50 rounded w-24 animate-pulse"></div>
                    ) : (
                        <p className="font-medium">
                            ${formatTokenAmount(liquidationPrice || 0n, { decimals: 4 })}
                        </p>
                    )}
                </div>

                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <AlertCircle className="size-4" />
                        Health Factor
                    </p>
                    {isLoading ? (
                        <div className="h-5 bg-muted/50 rounded w-16 animate-pulse"></div>
                    ) : (
                        <p className={`font-medium ${healthColor}`}>
                            {health ? (Number(health) / 100).toFixed(2) : '0.00'}
                        </p>
                    )}
                </div>

                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <TrendingUp className="size-4" />
                        Leverage
                    </p>
                    {isLoading ? (
                        <div className="h-5 bg-muted/50 rounded w-16 animate-pulse"></div>
                    ) : (
                        <p className="font-medium">
                            {leverage ? (Number(leverage) / 100).toFixed(2) : '1.00'}x
                        </p>
                    )}
                </div>
            </div>
        </>
    );

    // Expanded content (only shown when expanded)
    const expandedContent = isExpanded && (
        <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Base Collateral</p>
                    <p className="font-medium">
                        {formatTokenAmount(baseCollateral || 0n)} {collateralTokenSymbol}
                    </p>
                </div>

                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Effective Collateral</p>
                    <p className="font-medium">
                        {formatTokenAmount(effectiveCollateral || 0n)} {collateralTokenSymbol}
                    </p>
                </div>

                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Borrowed Amount</p>
                    <p className="font-medium">
                        {formatTokenAmount(borrowShares || 0n)} {loanTokenSymbol}
                    </p>
                </div>

                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">LTV (Loan to Value)</p>
                    <p className="font-medium">
                        {ltv ? (Number(ltv) / 10000).toFixed(2) : '0.00'}%
                    </p>
                </div>
            </div>

            <div className="flex gap-2 mt-4">
                <Button
                    className="flex-1"
                    variant="outline"
                    size="sm"
                    onClick={handleAddCollateral}
                >
                    <ArrowDownCircle className="size-4 mr-1" />
                    Add Collateral
                </Button>
                <Button
                    className="flex-1"
                    variant="outline"
                    size="sm"
                    onClick={handleAdjustLeverage}
                >
                    <TrendingUp className="size-4 mr-1" />
                    Adjust Leverage
                </Button>
                <Button
                    className="flex-1"
                    variant="secondary"
                    size="sm"
                    onClick={handleClosePosition}
                >
                    <ArrowUpCircle className="size-4 mr-1" />
                    Close
                </Button>
            </div>
        </div>
    );

    const collapsedButtons = !isExpanded && (
        <div className="flex gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={handleAddCollateral}
            >
                <ArrowDownCircle className="size-3.5 mr-1" />
                Add
            </Button>
            <Button
                variant="secondary"
                size="sm"
                onClick={handleClosePosition}
            >
                <ArrowUpCircle className="size-3.5 mr-1" />
                Close
            </Button>
        </div>
    );

    return (
        <div
            onClick={handleClick}
            className="bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        >
            <div className="p-6 space-y-4">
                {baseContent}

                {expandedContent}

                <div className="flex items-center justify-between mt-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleToggleExpand}
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                        <Info className="size-3.5" />
                        {isExpanded ? 'Show less' : 'Show more'}
                    </Button>

                    {collapsedButtons}
                </div>
            </div>
        </div>
    );
}