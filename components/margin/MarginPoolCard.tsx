import { Address } from 'viem';
import { formatAddress } from '@/lib/utils';
import { Button } from '@/components/shared/Button';
import { PoolDetails } from '@/config/contracts';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Scale, TrendingUp, ChevronDown, ChevronUp, Info, Database } from 'lucide-react';

interface MarginPoolCardProps {
    poolAddress: Address;
    pool: PoolDetails;
    onTrade?: (poolAddress: Address) => void;
}

export function MarginPoolCard({ poolAddress, pool, onTrade }: MarginPoolCardProps) {
    const router = useRouter();
    const [isExpanded, setIsExpanded] = useState(false);

    const handleClick = () => {
        router.push(`/margin/${poolAddress}`);
    };

    const handleTrade = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onTrade) {
            onTrade(poolAddress);
        } else {
            router.push(`/margin/${poolAddress}/trade`);
        }
    };

    const handleToggleExpand = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    const StatusBadge = () => (
        <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
            pool.isActive
                ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'
        }`}>
            <span className={`size-1.5 rounded-full ${
                pool.isActive ? 'bg-green-500' : 'bg-red-500'
            }`} />
            {pool.isActive ? 'Active' : 'Inactive'}
        </div>
    );

    // Base content (shown in both collapsed and expanded views)
    const baseContent = (
        <>
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-lg font-semibold">
                        {pool.loanTokenSymbol}/{pool.collateralTokenSymbol}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Pool ID: {formatAddress(poolAddress)}
                    </p>
                </div>
                <StatusBadge />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Database className="size-4" />
                        Loan Token
                    </p>
                    <p className="font-medium">
                        {pool.loanTokenSymbol}
                    </p>
                </div>

                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Database className="size-4" />
                        Collateral Token
                    </p>
                    <p className="font-medium">
                        {pool.collateralTokenSymbol}
                    </p>
                </div>

                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Scale className="size-4" />
                        Position Type
                    </p>
                    <p className="font-medium">
                        {pool.positionType === 0 ? 'LONG' : 'SHORT'}
                    </p>
                </div>

                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <TrendingUp className="size-4" />
                        Max Leverage
                    </p>
                    <p className="font-medium">
                        3x
                    </p>
                </div>
            </div>
        </>
    );

    // Expanded content (only shown when expanded)
    const expandedContent = isExpanded && (
        <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Interest Rate</p>
                    <p className="font-medium">
                        {pool.interestRate ? (Number(pool.interestRate)).toFixed(2) : '0.00'}%
                    </p>
                </div>

                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Liquidation Threshold</p>
                    <p className="font-medium">
                        {pool.liquidationThresholdPercentage ? (Number(pool.liquidationThresholdPercentage)).toFixed(2) : '0.00'}%
                    </p>
                </div>

                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Creator</p>
                    <p className="font-medium font-mono text-xs">
                        {formatAddress(pool.creator)}
                    </p>
                </div>

                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="font-medium">
                        Feb 26, 2025
                    </p>
                </div>
            </div>

            <Button
                className="w-full"
                onClick={handleTrade}
                disabled={!pool.isActive}
            >
                Start Trading
            </Button>
        </div>
    );

    const collapsedButtons = !isExpanded && (
        <Button
            variant="secondary"
            size="sm"
            onClick={handleTrade}
            disabled={!pool.isActive}
        >
            Trade
        </Button>
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