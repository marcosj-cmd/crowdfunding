import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

export interface Campaign {
  id: string;
  title: string;
  creator: string;
  image: string;
  category: string;
  goal: number;
  raised: number;
  daysLeft: number;
}

export default function CampaignCard({ campaign }: { campaign: Campaign }) {
  const [raised, setRaised] = useState<number>(campaign.raised || 0);
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<string>("");

  const pct = Math.min(100, Math.round((raised / campaign.goal) * 100));

  const handleConfirm = () => {
    const v = parseFloat(amount);
    if (isNaN(v) || v <= 0) {
      window.alert("Please enter a valid amount in ETH.");
      return;
    }
    setRaised((r) => r + v);
    window.alert(`Thank you for contributing ${v} ETH to ${campaign.title} (simulated).`);
    setAmount("");
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
          <img src={campaign.image} alt={campaign.title} className="h-full w-full object-cover" />
        </div>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 px-2 py-0.5">{campaign.category}</span>
            <span>by {campaign.creator}</span>
          </div>
          <h3 className="text-base font-semibold leading-tight">{campaign.title}</h3>
          <div className="space-y-2">
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className={cn("h-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-500")}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="font-semibold">{raised.toFixed(3)} ETH</div>
              <div className="text-muted-foreground">{pct}%</div>
              <div className="text-muted-foreground">{campaign.daysLeft} days left</div>
            </div>
          </div>
          <Button className="w-full bg-foreground text-background hover:bg-foreground/90" onClick={() => setOpen(true)}>Back this project</Button>
        </CardContent>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={`Contribute to "${campaign.title}"`} onConfirm={handleConfirm} confirmLabel="Contribute">
        <div>
          <label className="block text-sm font-medium mb-2">Amount (ETH)</label>
          <input className="w-full rounded-md border border-input px-3 py-2 bg-background" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 0.05" />
          <p className="mt-2 text-sm text-muted-foreground">The contribution is simulated locally for now (no real transaction).</p>
        </div>
      </Modal>
    </>
  );
}
