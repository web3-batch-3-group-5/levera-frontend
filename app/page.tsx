'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/shared/Button';

export default function HomePage() {
    const router = useRouter();

    const handleButton = () => {
        router.push('/pools');
    };

    return (
        <main className="flex-1">
            <div className="container mx-auto px-4 lg:px-16 py-16">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">
                        Welcome to <span className="text-primary">Levera</span>
                    </h1>
                    <p className="text-muted-foreground text-lg mb-8">
                        Permissionless margin trading for the decentralized world.
                    </p>

                    <div className="flex justify-center gap-4">
                        <Button
                            variant="default"
                            size="lg"
                            onClick={handleButton}
                            className="gap-2"
                        >
                            Get Started
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => router.push('/docs')}
                            className="gap-2"
                        >
                            Learn More
                        </Button>
                    </div>
                </div>

                <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="p-6 bg-card rounded-lg shadow-sm border">
                        <h2 className="text-xl font-bold mb-2">Earn</h2>
                        <p className="text-muted-foreground">
                            Earn passive APY and extra rewards, withdraw any time.
                        </p>
                    </div>
                    <div className="p-6 bg-card rounded-lg shadow-sm border">
                        <h2 className="text-xl font-bold mb-2">Borrow</h2>
                        <p className="text-muted-foreground">
                            Borrow assets with leverage.
                        </p>
                    </div>
                    <div className="p-6 bg-card rounded-lg shadow-sm border">
                        <h2 className="text-xl font-bold mb-2">Trade</h2>
                        <p className="text-muted-foreground">
                            Execute margin trades with ease and efficiency.
                        </p>
                    </div>
                </div>

                <div className="mt-20">
                </div>
            </div>
        </main>
    );
}