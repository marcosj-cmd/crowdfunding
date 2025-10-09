import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CampaignCard, { type Campaign } from "@/components/crowdfunding/CampaignCard";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

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

  useEffect(() => {
    if (!account) {
      setCampaigns([]);
      return;
    }
    const key = `sf_campaigns_${account}`;
    try {
      const raw = localStorage.getItem(key) || "[]";
      const parsed = JSON.parse(raw) as Campaign[];
      setCampaigns(parsed);
    } catch (e) {
      setCampaigns([]);
    }
  }, [account]);

  const handleDelete = (id: string) => {
    if (!account) return;
    const key = `sf_campaigns_${account}`;
    const raw = localStorage.getItem(key) || "[]";
    const parsed = JSON.parse(raw) as Campaign[];
    const filtered = parsed.filter((c) => c.id !== id);
    localStorage.setItem(key, JSON.stringify(filtered));
    setCampaigns(filtered);
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
            <div className="rounded-lg border bg-card p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Goal</TableHead>
                    <TableHead>Raised</TableHead>
                    <TableHead>Ends in</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="flex items-center gap-3">
                        <img src={c.image} alt={c.title} className="h-12 w-16 object-cover rounded-md" />
                        <div>
                          <div className="font-medium">{c.title}</div>
                          <div className="text-xs text-muted-foreground">by {c.creator}</div>
                        </div>
                      </TableCell>
                      <TableCell>{c.category}</TableCell>
                      <TableCell>{c.goal.toFixed(3)} ETH</TableCell>
                      <TableCell>{c.raised.toFixed(3)} ETH</TableCell>
                      <TableCell>{c.daysLeft} days</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button className="bg-red-600 text-white" onClick={() => handleDelete(c.id)}>Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
