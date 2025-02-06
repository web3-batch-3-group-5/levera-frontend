import '@rainbow-me/rainbowkit/styles.css';
import {
    connectorsForWallets,
    getDefaultWallets,
} from '@rainbow-me/rainbowkit';
import { http, createConfig } from 'wagmi';
import { mainnet, sepolia, arbitrum, arbitrumSepolia } from 'wagmi/chains';

export const chains = [mainnet, sepolia, arbitrum, arbitrumSepolia] as const;

const projectId = 'b888ce41be0433ef0fcde58c52ae199c'; //projectId from cloud.reown.com
const appName = 'levera';

const { wallets } = getDefaultWallets({
    appName,
    projectId,
});

const connectors = connectorsForWallets([
    ...wallets,
], {
    appName,
    projectId,
});

// Create the wagmi configuration
export const wagmiConfig = createConfig({
    connectors,
    chains,
    transports: {
        [mainnet.id]: http(),
        [sepolia.id]: http(),
        [arbitrum.id]: http(),
        [arbitrumSepolia.id]: http(),
    },
});