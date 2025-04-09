'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@/components/shared/ConnectButton';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';

export function Header() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { name: 'Home', href: '/' },
        { name: 'Earn', href: '/pools' },
        { name: 'Margin', href: '/margin' },
        { name: 'Faucet', href: '/faucet' },
    ];

    const isActive = (href: string) => pathname === href;

    return (
        <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="relative h-8 w-8">
                            <Image
                                src="/levera-temp-logo.png"
                                alt="Levera Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <span className="text-xl font-bold text-foreground">Levera</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors',
                                    isActive(item.href) && 'text-foreground bg-secondary'
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-2">
                        <ThemeToggle />
                        <ConnectButton />
                    </div>

                    <button
                        className="md:hidden p-2 text-muted-foreground hover:text-foreground"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                {isMobileMenuOpen && (
                    <div className="md:hidden py-4 absolute top-16 left-0 right-0 bg-background border-b">
                        <div className="flex flex-col space-y-2 px-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors',
                                        isActive(item.href) && 'text-foreground bg-secondary'
                                    )}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            <div className="flex items-center justify-between px-3 pt-4">
                                <ThemeToggle />
                                <ConnectButton />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}