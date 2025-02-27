import { formatUnits } from 'viem';

interface FormatTokenAmountOptions {
    decimals?: number;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    compact?: boolean;
}

export function formatTokenAmount(
    amount: bigint | undefined,
    options: FormatTokenAmountOptions = {}
): string {
    if (!amount) return '0.00';

    const {
        decimals = 18,
        minimumFractionDigits = 2,
        maximumFractionDigits = 4,
        compact = false
    } = options;

    try {
        // Convert from token base units to decimal representation
        const formattedAmount = formatUnits(amount, decimals);
        const numericAmount = parseFloat(formattedAmount);

        // Format with number formatter
        const formatter = new Intl.NumberFormat('en-US', {
            minimumFractionDigits,
            maximumFractionDigits,
            notation: compact ? 'compact' : 'standard',
            compactDisplay: 'short'
        });

        return formatter.format(numericAmount);
    } catch (error) {
        console.error('Error formatting token amount:', error);
        return '0.00';
    }
}

// Example usage:
// formatTokenAmount(1234567890000000000n) -> "1.23"
// formatTokenAmount(1234567890000000000n, { maximumFractionDigits: 4 }) -> "1.2346"
// formatTokenAmount(1234567890000000000000n, { compact: true }) -> "1.23K"