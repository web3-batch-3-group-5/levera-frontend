import { http, createConfig } from 'wagmi'
import { arbitrumSepolia } from 'wagmi/chains'
import { astriaFlameDawn } from '@/lib/chains'
import { injected, walletConnect } from 'wagmi/connectors'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

if (!projectId) throw new Error('WalletConnect project ID is not defined')

export const config = createConfig({
    chains: [arbitrumSepolia, astriaFlameDawn],
    transports: {
        [arbitrumSepolia.id]: http(process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL),
        [astriaFlameDawn.id]: http(process.env.NEXT_PUBLIC_ASTRIA_FLAME_DAWN_RPC_URL),
    },
    connectors: [
        injected(),
        walletConnect({
            projectId,
            metadata: {
                name: 'Levera Finance',
                description: 'Permissionless margin trading platform',
                url: 'https://levera.finance',
                icons: ['/assets/levera-temp-logo.png']
            }
        })
    ],
})