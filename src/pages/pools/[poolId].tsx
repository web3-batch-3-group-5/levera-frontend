import { useRouter } from "next/router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";

export default function PoolDetailsPage() {
  const router = useRouter();
  const { poolId } = router.query;

  const pool = {
    poolId: poolId,
    name: poolId?.toString().toUpperCase(),
    supply: "$1,000,000",
    supplyAPY: "10%",
    borrowed: "$500,000",
    userBalance: "$10,000",
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <Header />
    
      <main className="flex-1 container mx-auto px-16 py-16">
        <section className="mt-20">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-4">{pool.name} Pool</h1>
            <p className="text-muted-foreground">
            Supply or withdraw {pool.name} from the pool.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Pool Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <p>Total Supply</p>
                  <p className="font-semibold">{pool.supply}</p>
                </div>
                <div className="flex justify-between">
                  <p>Supply APY</p>
                  <p className="font-semibold">{pool.supplyAPY}</p>
                </div>
                <div className="flex justify-between">
                  <p>Total Borrowed</p>
                  <p className="font-semibold">{pool.borrowed}</p>
                </div>
                <div className="flex justify-between">
                  <p>Your Balance</p>
                  <p className="font-semibold">{pool.userBalance}</p>
                </div>
              </div>
            </CardContent>
          </Card>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Supply {pool.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input placeholder="Enter amount to supply" />
            <Button className="w-full">Supply</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Withdraw {pool.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input placeholder="Enter amount to withdraw" />
            <Button className="w-full" variant="outline">
              Withdraw
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
          </main>
    
          
          <Footer />
        </div>
    
  );
}