import Link from 'next/link';
import { useRouter } from 'next/router';
import { ConnectButton } from './ConnectButton';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export function Header() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Earn', href: '/earn' },
    { name: 'Borrow', href: '/borrow' },
    { name: 'Trade', href: '/trade' },
  ];

  const isActive = (href: string) => router.pathname === href;

  return (
    <nav className="p-4 border-b border-gray-100 bg-white shadow-lg">
      <div className="container mx-auto px-16 py-4">
        <div className="flex justify-between items-center h-16">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/levera-temp-logo.png"
            alt="Levera Logo"
            className="h-12 w-12"
          />
          <span className="text-xl font-bold text-gray-900">Levera</span>
        </Link>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium',
                  isActive(item.href) && 'text-gray-900 bg-gray-100'
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:block">
            <ConnectButton />
          </div>

          <button
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium',
                    isActive(item.href) && 'text-gray-900 bg-gray-100'
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="px-3 pt-4">
                <ConnectButton />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}