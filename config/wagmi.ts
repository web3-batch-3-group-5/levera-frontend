import { http, createConfig } from 'wagmi'
import { arbitrumSepolia } from 'wagmi/chains'
import { leverabicaLight } from '@/lib/chains'
import { injected, walletConnect } from 'wagmi/connectors'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
const RPC_1 = process.env.NEXT_PUBLIC_LEVERABICA_LIGHT_RPC_URL
const RPC_2 = process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL

if (!projectId) throw new Error('WalletConnect project ID is not defined')

export const config = createConfig({
    chains: [leverabicaLight, arbitrumSepolia],
    transports: {
        [leverabicaLight.id]: http(RPC_1),
        [arbitrumSepolia.id]: http(RPC_2),
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
            },
        })
    ],
})