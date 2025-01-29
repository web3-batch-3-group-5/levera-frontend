import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccount } from "wagmi";
import { ConnectButton } from "../shared/ConnectButton";

import peopleWallet from "@/assets/svg/people-wallet.svg";

export default function LendingPool() {
  const account = useAccount();

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
      <div className="grid md:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <CardTitle>Your Supplies</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Nothing supplied yet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Borrows</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Nothing borrowed yet.</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-5 grid md:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <CardTitle>Assets to supply</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Nothing supplied yet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assets to borrow</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Nothing borrowed yet.</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
