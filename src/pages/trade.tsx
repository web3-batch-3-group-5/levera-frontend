import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';

export default function Trade() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <Header />

      <main className="flex-1 container mx-auto px-16 py-8">
        <h2 className="text-3xl font-bold mb-4">Levera Trade</h2>
        <p className="text-gray-800 mb-8">Earn passive APY and extra rewards, withdraw any time. Sit back, relax, and earn fees from borrowers.</p>
      </main>

      <Footer />
    </div>
  );
}