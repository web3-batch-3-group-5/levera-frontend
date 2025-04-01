import { Chain } from '@rainbow-me/rainbowkit';

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

export const leverabicaLight: Chain = {
    id: 109695,
    name: 'Leverabica Light',
    iconUrl: 'https://png.pngtree.com/png-vector/20220915/ourmid/pngtree-coffee-bean-icon-vector-png-image_6174527.png',
    iconBackground: '#fff',
    nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: [process.env.NEXT_PUBLIC_LEVERABICA_LIGHT_RPC_URL || ''],
        },
    },
} as const;

export const customChains = [ leverabicaLight ];
