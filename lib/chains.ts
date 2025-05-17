import { Chain } from '@rainbow-me/rainbowkit';
import { baseSepolia as defaultBaseSepolia } from 'wagmi/chains';

export const baseSepolia: Chain = {
    ...defaultBaseSepolia,
    rpcUrls: {
        default: {
            http: [process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org'],
        },
    },
};

