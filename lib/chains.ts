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
            http: ['https://rpc.flame.dawn-1.astria.org'],
        },
    },
    blockExplorers: {
        default: { name: 'Flame Explorer', url: 'https://explorer.flame.dawn-1.astria.org' },
    },
} as const;

export const customChains = [ astriaFlameDawn ];
