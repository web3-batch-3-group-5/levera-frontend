import Link from 'next/link';

export function Footer() {
  return (
    <footer className='mt-auto border-t bg-background'>
      <div className='container mx-auto px-4 lg:px-8 py-6'>
        <div className='flex flex-col items-center justify-between gap-4 sm:flex-row'>
          <p className='text-sm text-muted-foreground'>© {new Date().getFullYear()} Levera. All rights reserved.</p>
          <div className='flex items-center gap-6'>
            <Link
              href='https://twitter.com/levera_finance'
              className='text-muted-foreground hover:text-foreground transition-colors'
              target='_blank'
              rel='noopener noreferrer'
            >
              Twitter
            </Link>
            <Link
              href='https://discord.gg/levera'
              className='text-muted-foreground hover:text-foreground transition-colors'
              target='_blank'
              rel='noopener noreferrer'
            >
              Discord
            </Link>
            <Link
              href='https://docs.levera.finance'
              className='text-muted-foreground hover:text-foreground transition-colors'
              target='_blank'
              rel='noopener noreferrer'
            >
              Docs
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
