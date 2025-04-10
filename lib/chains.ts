import { Chain } from '@rainbow-me/rainbowkit';
import { arbitrumSepolia as defaultArbitrumSepolia } from 'wagmi/chains';

export const arbitrumSepolia: Chain = {
    ...defaultArbitrumSepolia,
    rpcUrls: {
        default: {
            http: [process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL || 'https://sepolia-rollup.arbitrum.io/rpc'],
        },
    },
};

export const astriaFlameDawn: Chain = {
    id: 16604737732183,
    name: 'Astria Flame (Dawn-1)',
    iconUrl: 'https://flame.astria.org/static/media/flame-logo.56ff25f8.png',
    iconBackground: '#fff',
    nativeCurrency: {
        name: 'TIA',
        symbol: 'TIA',
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: [process.env.NEXT_PUBLIC_ASTRIA_FLAME_DAWN_RPC_URL || ''],
        },
    },
    blockExplorers: {
        default: { name: 'Flame Explorer', url: 'https://explorer.flame.dawn-1.astria.org' },
    },
} as const;

export const eduChainTestnet: Chain = {
    id: 656476,
    name: 'Educhain Testnet',
    iconUrl: 'https://s3.coinmarketcap.com/static-gravity/image/60f1fc5d85f2463881db170b6d740876.png',
    iconBackground: '#fff',
    nativeCurrency: {
        name: 'EDU',
        symbol: 'EDU',
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: ['https://rpc.open-campus-codex.gelato.digital'],
        },
    },
    blockExplorers: {
        default: { name: 'Educhain Explorer', url: 'https://edu-chain-testnet.blockscout.com' },
    },
} as const;

export const customChains = [ astriaFlameDawn, eduChainTestnet ];
