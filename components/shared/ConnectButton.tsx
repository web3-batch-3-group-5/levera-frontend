'use client';

import { FC } from 'react';
import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/shared/Button';
import Image from 'next/image';

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
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button onClick={openConnectModal} size='lg'>
                    Connect Wallet
                  </Button>
                );
              }

              if (chain.unsupported) {
                return (
                  <Button
                    onClick={openChainModal}
                    size='lg'
                    variant='destructive'
                  >
                    Wrong Network
                  </Button>
                );
              }

              return (
                <div className='flex items-center gap-3'>
                  <Button onClick={openChainModal} size='lg' variant='outline'>
                    {chain.hasIcon && (
                      <div className='size-5'>
                        {chain.iconUrl && (
                          <Image
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            style={{ width: '20px', height: '20px' }}
                            width={20}
                            height={20}
                          />
                        )}
                      </div>
                    )}
                  </Button>

                  <Button onClick={openAccountModal} size='lg'>
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

export default ConnectButton;
