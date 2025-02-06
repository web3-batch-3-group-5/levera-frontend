import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccount, useReadContract } from "wagmi";
import { ConnectButton } from "../shared/ConnectButton";
import peopleWallet from "@/assets/svg/people-wallet.svg";
import { useRouter } from "next/router";
import { Address, formatUnits } from "viem";
import { useTotalBorrowAssets, useTotalSupplyAssets } from "@/hooks/useLendingPool";
import { formatUSDC } from "@/lib/format";

const poolAddress: Address = "0xBeaB07B1EECA9B51BD32E90d68F6043eF3f71b0a";
const loanToken: Address = "0x919c586538EE34B87A12c584ba6463e7e12338E9";
const collateralToken: Address = "0xe7d9E1dB89Ce03570CBA7f4C6Af80EC14a61d1db";

export default function LendingPool() {
  const account = useAccount();
  const router = useRouter();

  const { data: totalSupplyRaw } = useTotalSupplyAssets();
  const { data: totalBorrowRaw } = useTotalBorrowAssets();

  const totalSupply = totalSupplyRaw ? formatUnits(totalSupplyRaw, 18) : "0";
  const totalBorrow = totalBorrowRaw ? formatUnits(totalBorrowRaw, 18) : "0";

  const pools = [
    {
      poolId: "usd-coin",
      poolName: "USDC",
      supply: totalSupply,
      supplyAPY: "5%",
      borrowed: totalBorrow,
      userBalance: "$10,000",
    },
    {
      poolId: "wrapped-bitcoin",
      poolName: "WBTC",
      supply: "$2,000,000",
      supplyAPY: "8%",
      borrowed: "$1,200,000",
      userBalance: "$5,000",
    },
  ];

  const handleRowClick = (poolAddress: string) => {
    router.push(`/pools/${poolAddress}`);
  };

  if (account.status === "disconnected") {
    return (
      <section className="mt-20">
        <Card>
          <div className="py-8 flex items-center flex-col">
            <img
              src={peopleWallet.src}
              width={100}
              height={200}
              alt="People wallet"
            />

            <div className="mt-5 mb-7 text-center space-y-1">
              <h3 className="text-xl font-semibold">
                Please, connect your wallet
              </h3>
              <p className="text-muted-foreground">
                Please connect your wallet to see your supplies, borrowings, and
                open positions.
              </p>
            </div>

            <ConnectButton />
          </div>
        </Card>
      </section>
    );
  }

  return (
    <section className="mt-20">
      <Card>
        <CardHeader>
          <CardTitle>Available Pools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="p-3">Pool Name</th>
                  <th className="p-3">Supply</th>
                  <th className="p-3">Supply APY</th>
                  <th className="p-3">Borrowed</th>
                  <th className="p-3">Your Balance</th>
                </tr>
              </thead>
              <tbody>
                {pools.map((pool, index) => (
                  <tr
                    key={index}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleRowClick(poolAddress)}
                  >
                    <td className="p-3 flex items-center gap-2">
                      <img
                        src={`https://cryptologos.cc/logos/${pool.poolId.toLowerCase()}-${pool.poolName.toLowerCase()}-logo.png`}
                        alt={pool.poolName}
                        className="w-6 h-6"
                      />
                      <span>{pool.poolName}</span>
                    </td>
                    <td className="p-3">$ {pool.supply}</td>
                    <td className="p-3">{pool.supplyAPY}</td>
                    <td className="p-3">$ {pool.borrowed}</td>
                    <td className="p-3">{pool.userBalance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
