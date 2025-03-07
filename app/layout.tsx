import { Inter } from 'next/font/google'
import { RootProvider } from '@/providers/RootProvider'
import { NotificationProvider } from '@/providers/NotificationProvider';
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import '@rainbow-me/rainbowkit/styles.css'
import '@/styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
    title: 'Levera Finance',
    description: 'Permissionless margin trading platform',
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
        <body className={inter.className}>
        <RootProvider>
            <div className="min-h-screen flex flex-col bg-background">
                <Header />
                <main className="flex-1">
                    {children}
                    <NotificationProvider />
                </main>
                <Footer />
            </div>
        </RootProvider>
        </body>
        </html>
    )
}