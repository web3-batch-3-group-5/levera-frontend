'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/shared/Button';
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
    const router = useRouter();

    return (
        <main className="flex-1">
            <div className="container flex flex-col items-center justify-center min-h-[80vh] px-4 lg:px-16">
                <div className="text-center space-y-6">
                    <div className="space-y-2">
                        <h1 className="text-7xl font-bold text-primary">404</h1>
                        <h2 className="text-2xl font-semibold">Page Not Found</h2>
                    </div>

                    <p className="text-muted-foreground text-lg max-w-md mx-auto">
                        Sorry, we couldn't find the page you're looking for. Please check the URL or go back to the homepage.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => router.back()}
                            className="gap-2"
                        >
                            <ArrowLeft className="size-4" />
                            Go Back
                        </Button>
                        <Button
                            variant="default"
                            size="lg"
                            onClick={() => router.push('/')}
                            className="gap-2"
                        >
                            <Home className="size-4" />
                            Return Home
                        </Button>
                    </div>
                </div>
            </div>
        </main>
    );
}