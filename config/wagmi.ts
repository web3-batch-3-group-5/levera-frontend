import { arbitrumSepolia, eduChainTestnet } from '@/lib/chains';
import { createConfig, http } from 'wagmi';
import { injected, walletConnect } from 'wagmi/connectors';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId) throw new Error('WalletConnect project ID is not defined');

export const config = createConfig({
  chains: [eduChainTestnet, arbitrumSepolia],
  transports: {
    [eduChainTestnet.id]: http(eduChainTestnet.rpcUrls.default.http[0]),
    [arbitrumSepolia.id]: http(arbitrumSepolia.rpcUrls.default.http[0]),
  },
  connectors: [
    injected(),
    walletConnect({
      projectId,
      metadata: {
        name: 'Levera Finance',
        description: 'Permissionless margin trading platform',
        url: 'https://levera.netlify.app/',
        icons: ['/assets/levera-temp-logo.png'],
      },
    }),
  ],
});
