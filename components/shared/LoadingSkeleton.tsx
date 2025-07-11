import React from 'react';

interface LoadingSkeletonProps {
  variant?: 'card' | 'list' | 'table';
  count?: number;
  className?: string;
}

export function LoadingSkeleton({ variant = 'card', count = 3, className = '' }: LoadingSkeletonProps) {
  // Card loading skeleton
  if (variant === 'card') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className='bg-card animate-pulse rounded-lg h-64 border'>
            <div className='p-6 space-y-4'>
              <div className='flex justify-between'>
                <div className='h-6 bg-muted rounded w-1/3'></div>
                <div className='h-6 bg-muted rounded w-16'></div>
              </div>
              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <div className='h-4 bg-muted rounded w-24'></div>
                    <div className='h-5 bg-muted rounded w-20'></div>
                  </div>
                  <div className='space-y-2'>
                    <div className='h-4 bg-muted rounded w-24'></div>
                    <div className='h-5 bg-muted rounded w-20'></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // List loading skeleton
  if (variant === 'list') {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className='border rounded-lg p-4 bg-card animate-pulse'>
            <div className='h-6 w-1/3 bg-muted rounded mb-4'></div>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-4'>
              <div className='space-y-2'>
                <div className='h-4 w-16 bg-muted rounded'></div>
                <div className='h-5 w-20 bg-muted rounded'></div>
              </div>
              <div className='space-y-2'>
                <div className='h-4 w-16 bg-muted rounded'></div>
                <div className='h-5 w-20 bg-muted rounded'></div>
              </div>
              <div className='space-y-2'>
                <div className='h-4 w-16 bg-muted rounded'></div>
                <div className='h-5 w-20 bg-muted rounded'></div>
              </div>
              <div className='space-y-2'>
                <div className='h-4 w-16 bg-muted rounded'></div>
                <div className='h-5 w-20 bg-muted rounded'></div>
              </div>
            </div>
            <div className='h-9 w-full bg-muted rounded'></div>
          </div>
        ))}
      </div>
    );
  }

  // Table loading skeleton
  if (variant === 'table') {
    return (
      <div className={`border rounded-lg overflow-hidden ${className}`}>
        <div className='bg-card animate-pulse'>
          <div className='p-4 border-b'>
            <div className='h-6 bg-muted rounded w-1/4'></div>
          </div>
          <div className='divide-y'>
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className='p-4 grid grid-cols-4 gap-4'>
                <div className='h-5 bg-muted rounded'></div>
                <div className='h-5 bg-muted rounded'></div>
                <div className='h-5 bg-muted rounded'></div>
                <div className='h-5 bg-muted rounded'></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
