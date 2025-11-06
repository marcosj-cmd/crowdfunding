import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import CampaignCard, { type Campaign } from "@/components/crowdfunding/CampaignCard";
import crowdfundingAbi from "@/../../abis/Crowdfunding.json";

const CONTRACT_ADDRESS = "0x3cebA30E37c91E6CD74d84d5Ce0d18c8248aaF59";

async function fetchCampaignsForOwner(owner: string | null) {
  if (!owner) return [];
  const res = await fetch(`/api/campaigns/paginated?owner=${owner}`);
  if (!res.ok) throw new Error("no-api");
  const json = await res.json();
  const items = json?.items ?? json?.data ?? (Array.isArray(json) ? json : []);
  return items as Campaign[];
}

export default function MyCampaigns() {
  const [account, setAccount] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    const eth = (window as any).ethereum;
    if (!eth) return;

    const load = async () => {
      try {
        const accounts = (await eth.request({ method: "eth_accounts" })) as string[];
        if (accounts && accounts.length) setAccount(accounts[0]);
      } catch (e) {
        // ignore
      }
    };

    load();

    const handleAccounts = (accounts: string[]) => {
      if (!accounts || accounts.length === 0) setAccount(null);
      else setAccount(accounts[0]);
    };

    eth.on && eth.on("accountsChanged", handleAccounts);
    return () => {
      eth.removeListener && eth.removeListener("accountsChanged", handleAccounts);
    };
  }, []);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["myCampaigns", account],
    queryFn: () => fetchCampaignsForOwner(account),
    enabled: !!account,
  });

  useEffect(() => {
    if (!account) {
      setCampaigns([]);
      return;
    }
    setCampaigns(data ?? []);
  }, [account, data]);
  // Función para withdraw
  const handleWithdraw = async (id: number) => {
    try {
      if (!(window as any).ethereum) throw new Error("No wallet detected");
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, crowdfundingAbi, signer);
      const tx = await contract.withdrawFunds(id);
      await tx.wait();
      alert("Withdraw realizado con éxito");
      await refetch();
    } catch (err: any) {
      alert("Error al hacer withdraw: " + (err?.message || err));
    }
  };

  return (
    <div className="container py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Campaigns</h1>
      </div>

      <div className="mt-8">
        {!account ? (
          <div className="p-6 rounded-lg border bg-card text-card-foreground">
            <p className="text-sm">Connect your wallet to view and manage your campaigns.</p>
          </div>
        ) : isLoading ? (
          <div className="p-6 rounded-lg border bg-card text-card-foreground">Loading...</div>
        ) : campaigns.length === 0 ? (
          <div className="p-6 rounded-lg border bg-card text-card-foreground">
            <p className="text-sm">You have no campaigns yet.</p>
            <div className="mt-4">
              <Link to="/create">
                <Button className="bg-foreground text-background">Start your first campaign</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <div className="rounded-lg border bg-card p-4 max-h-[60vh] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign </TableHead>
                    <TableHead>Campaign ID</TableHead>
                    <TableHead>Goal</TableHead>
                    <TableHead>Raised</TableHead>
                    <TableHead>Ends at</TableHead>
                     <TableHead>daysleft</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((c) => {
                    const daysLeft = Math.max(0, Math.floor((Number(c.deadline) - Date.now()) / (1000 * 60 * 60 * 24)));
                    const fecha = new Date(Number(c.deadline));
                    // Permitir withdraw apenas se alcance el goal
                    const canWithdraw = Number(c.funds) >= Number(c.goal);
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="flex items-center gap-3">
                          <img src={c.image} alt={c.title} className="h-12 w-16 object-cover rounded-md" />
                          <div>
                            <div className="font-medium">{c.title}</div>
                            <div className="text-xs text-muted-foreground">by {c.owner}</div>
                          </div>
                        </TableCell>
                        <TableCell>{c.id} </TableCell>
                        <TableCell>{Number(c.funds).toFixed(6)} ETH</TableCell>
                        <TableCell>{Number(c.goal).toFixed(6)} ETH</TableCell>
                        <TableCell>{daysLeft} days</TableCell>
                        <TableCell>{fecha.toLocaleString()}</TableCell>
                        <TableCell>
                          <Button
                            className="bg-green-600 text-white"
                            disabled={!canWithdraw}
                            onClick={() => handleWithdraw(c.id)}
                          >
                            Withdraw
                          </Button>
                          {!canWithdraw && (
                            <div className="text-xs text-muted-foreground mt-1">No se alcanzó el goal</div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
