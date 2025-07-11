'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/shared/Button';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { ArrowRight } from 'lucide-react';
import { useAccount } from 'wagmi';

export default function HomePage() {
  const router = useRouter();
  const { isConnected } = useAccount();

  return (
    <main className='flex-1'>
      <div className='container mx-auto px-4 lg:px-16 py-16'>
        {/* Hero Section */}
        <div className='text-center mb-16'>
          <h1 className='text-5xl font-bold mb-4'>
            Welcome to <span className='text-primary'>Levera</span>
          </h1>
          <p className='text-xl text-muted-foreground mb-8 max-w-2xl mx-auto'>
            Permissionless margin trading for the decentralized world. <br />
            Long or short meme coins without approval.
          </p>

          <div className='flex justify-center gap-4'>
            <Button
              variant='default'
              size='lg'
              onClick={() => router.push(isConnected ? '/margin' : '/pools')}
              className='gap-2'
            >
              Get Started
              <ArrowRight className='size-4' />
            </Button>
            <Button
              variant='outline'
              size='lg'
              onClick={() => window.open('https://docs.levera.finance', '_blank')}
              className='gap-2'
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Dashboard Section (for connected users) */}
        {isConnected ? (
          <Dashboard />
        ) : (
          <>
            {/* Feature Cards (for non-connected users) */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-16'>
              <div className='p-6 bg-card rounded-lg shadow-sm border hover:shadow-md transition-shadow'>
                <h2 className='text-xl font-bold mb-3'>Supply & Earn</h2>
                <p className='text-muted-foreground mb-4'>
                  Supply your assets to lending pools to earn passive yield with competitive APYs.
                </p>
                <Button variant='default' onClick={() => router.push('/pools')} className='w-full'>
                  View Pools
                </Button>
              </div>
              <div className='p-6 bg-card rounded-lg shadow-sm border hover:shadow-md transition-shadow'>
                <h2 className='text-xl font-bold mb-3'>Trade with Leverage</h2>
                <p className='text-muted-foreground mb-4'>
                  Open leveraged positions up to 3x and maximize your trading strategy.
                </p>
                <Button variant='default' onClick={() => router.push('/margin')} className='w-full'>
                  Start Trading
                </Button>
              </div>
              <div className='p-6 bg-card rounded-lg shadow-sm border hover:shadow-md transition-shadow'>
                <h2 className='text-xl font-bold mb-3'>Create Pools</h2>
                <p className='text-muted-foreground mb-4'>
                  Create custom lending pools with your own parameters and interest rates.
                </p>
                <Button variant='default' onClick={() => router.push('/pools/create')} className='w-full'>
                  Create Pool
                </Button>
              </div>
            </div>

            {/* How It Works Section */}
            <div className='mb-20'>
              <h2 className='text-3xl font-bold mb-8 text-center'>How It Works</h2>
              <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
                <div className='bg-muted/30 p-6 rounded-lg border'>
                  <div className='bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold mb-4'>
                    1
                  </div>
                  <h3 className='text-lg font-semibold mb-2'>Connect Wallet</h3>
                  <p className='text-muted-foreground'>
                    Connect your wallet to access Levera&apos;s permissionless margin trading platform.
                  </p>
                </div>
                <div className='bg-muted/30 p-6 rounded-lg border'>
                  <div className='bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold mb-4'>
                    2
                  </div>
                  <h3 className='text-lg font-semibold mb-2'>Choose a Pool</h3>
                  <p className='text-muted-foreground'>
                    Select from available lending pools or create your own with custom parameters.
                  </p>
                </div>
                <div className='bg-muted/30 p-6 rounded-lg border'>
                  <div className='bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold mb-4'>
                    3
                  </div>
                  <h3 className='text-lg font-semibold mb-2'>Supply or Trade</h3>
                  <p className='text-muted-foreground'>
                    Supply assets to earn interest or open leveraged trading positions.
                  </p>
                </div>
                <div className='bg-muted/30 p-6 rounded-lg border'>
                  <div className='bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold mb-4'>
                    4
                  </div>
                  <h3 className='text-lg font-semibold mb-2'>Manage Positions</h3>
                  <p className='text-muted-foreground'>
                    Adjust your positions, add collateral, or close positions to realize profits.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
