import { FC } from 'react';
import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '../ui/button';

export const ConnectButton: FC = () => {
    return (
        <RainbowConnectButton.Custom>
            {({
                  account,
                  chain,
                  openAccountModal,
                  openChainModal,
                  openConnectModal,
                  mounted,
              }) => {
                const ready = mounted;
                const connected = ready && account && chain;

                return (
                    <div
                        {...(!ready && {
                            'aria-hidden': true,
                            'style': {
                                opacity: 0,
                                pointerEvents: 'none',
                                userSelect: 'none',
                            },
                        })}
                    >
                        {(() => {
                            if (!connected) {
                                return (
                                    <Button
                                        onClick={openConnectModal}
                                        size="lg"
                                    >
                                        Connect Wallet
                                    </Button>
                                );
                            }

                            return (
                                <div className="flex items-center gap-3">
                                    <Button
                                        onClick={openChainModal}
                                        size="lg"
                                        variant="outline"
                                        className="!px-4"
                                    >
                                        {chain.hasIcon && (
                                            <div className="w-6 h-6">
                                                {chain.iconUrl && (
                                                    <img
                                                        alt={chain.name ?? 'Chain icon'}
                                                        src={chain.iconUrl}
                                                        className="w-6 h-6"
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </Button>

                                    <Button
                                        onClick={openAccountModal}
                                        size="lg"
                                    >
                                        {account.displayName}
                                    </Button>
                                </div>
                            );
                        })()}
                    </div>
                );
            }}
        </RainbowConnectButton.Custom>
    );
};