import { http, createConfig } from 'wagmi'
import { arbitrumSepolia } from 'wagmi/chains'
import { eduChainTestnet } from '@/lib/chains'
import { injected, walletConnect } from 'wagmi/connectors'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
const RPC_1 = 'https://rpc.open-campus-codex.gelato.digital'
const RPC_2 = process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL

if (!projectId) throw new Error('WalletConnect project ID is not defined')

export const config = createConfig({
    chains: [eduChainTestnet, arbitrumSepolia],
    transports: {
        [eduChainTestnet.id]: http(RPC_1),
        [arbitrumSepolia.id]: http(RPC_2),
    },
    connectors: [
        injected(),
        walletConnect({
            projectId,
            metadata: {
                name: 'Levera Finance',
                description: 'Permissionless margin trading platform',
                url: 'https://levera.netlify.app/',
                icons: ['/assets/levera-temp-logo.png']
            },
        })
    ],
})