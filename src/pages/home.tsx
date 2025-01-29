import LendingPool from "@/components/lending-pool/LendingPool";
import { Button } from "@/components/ui/button";

export function HomePage() {
  return (
    <>
      <main className="flex-1 container mx-auto px-16 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            Welcome to <span className="text-pink-500">Levera</span>
          </h1>
          <p className="text-gray-800 mb-8">
            Permissionless margin trading for the decentralized world.
          </p>

          <div className="flex justify-center gap-4">
            <Button variant="default" size="lg">
              Get Started
            </Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 bg-gray-100 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-2">Earn</h2>
            <p className="text-gray-800">
              Earn passive APY and extra rewards, withdraw any time.
            </p>
          </div>
          <div className="p-6 bg-gray-100 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-2">Borrow</h2>
            <p className="text-gray-800">Borrow assets with leverage.</p>
          </div>
          <div className="p-6 bg-gray-100 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-2">Trade</h2>
            <p className="text-gray-800">
              Execute margin trades with ease and efficiency.
            </p>
          </div>
        </div>

        <LendingPool />
      </main>
    </>
  );
}
