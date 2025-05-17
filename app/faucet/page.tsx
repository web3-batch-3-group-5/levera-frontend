'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import the TokenFaucet with no SSR
const TokenFaucet = dynamic(() => import('@/components/faucet/TokenFaucet').then(mod => mod.TokenFaucet), {
  ssr: false,
  loading: () => (
    <div className="bg-card rounded-lg border p-6 shadow-sm h-96 animate-pulse">
      <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
      <div className="h-4 bg-muted rounded w-2/3 mb-10"></div>
      <div className="space-y-6">
        <div className="h-10 bg-muted rounded w-full"></div>
        <div className="h-10 bg-muted rounded w-full"></div>
        <div className="h-16 bg-muted rounded w-full"></div>
        <div className="h-10 bg-muted rounded w-full"></div>
      </div>
    </div>
  )
});

export default function FaucetPage() {
  return (
    <main className="flex-1">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Levera Test Tokens</h1>
          <p className="text-muted-foreground mb-8">
            Get test tokens to try out the Levera platform on Base Sepolia testnet.
          </p>
          
          <Suspense fallback={
            <div className="bg-card rounded-lg border p-6 shadow-sm h-96 animate-pulse">
              <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
              <div className="h-4 bg-muted rounded w-2/3 mb-10"></div>
              <div className="space-y-6">
                <div className="h-10 bg-muted rounded w-full"></div>
                <div className="h-10 bg-muted rounded w-full"></div>
                <div className="h-16 bg-muted rounded w-full"></div>
                <div className="h-10 bg-muted rounded w-full"></div>
              </div>
            </div>
          }>
            <TokenFaucet />
          </Suspense>
        </div>
      </div>
    </main>
  );
}