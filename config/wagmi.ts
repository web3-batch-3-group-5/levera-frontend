import { http, createConfig } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

if (!projectId) throw new Error('WalletConnect project ID is not defined')

export const config = createConfig({
    chains: [baseSepolia],
    transports: {
        [baseSepolia.id]: http(baseSepolia.rpcUrls.default.http[0]),
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