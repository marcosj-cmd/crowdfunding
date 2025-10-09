import { useMemo, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CampaignCard, { type Campaign } from "@/components/crowdfunding/CampaignCard";
import { Card } from "@/components/ui/card";

const categories = ["Tech", "Design", "Art", "Community", "Games", "Craft"] as const;

export default function Create() {
  const [title, setTitle] = useState("");
  const [creator, setCreator] = useState("");
  const [category, setCategory] = useState<typeof categories[number]>(categories[0]);
  const [goal, setGoal] = useState(5);
  const [days, setDays] = useState(30);
  const [image, setImage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // auto-fill creator from connected wallet address (read-only)
  useEffect(() => {
    const eth = (window as any).ethereum;
    if (!eth) return;

    const load = async () => {
      try {
        const accounts = (await eth.request({ method: "eth_accounts" })) as string[];
        if (accounts && accounts.length) setCreator(accounts[0]);
      } catch (e) {
        // ignore
      }
    };

    load();

    const handleAccounts = (accounts: string[]) => {
      if (!accounts || accounts.length === 0) setCreator("");
      else setCreator(accounts[0]);
    };

    eth.on && eth.on("accountsChanged", handleAccounts);
    return () => {
      eth.removeListener && eth.removeListener("accountsChanged", handleAccounts);
    };
  }, []);

  const preview: Campaign = useMemo(() => {
    return {
      id: "preview",
      title: title || "Your campaign title",
      creator: creator || "Creator name",
      image: image || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop",
      category: category,
      goal: goal,
      raised: 0,
      daysLeft: days,
    };
  }, [title, creator, image, category, goal, days]);

  const validate = () => {
    if (!title.trim()) return "Title is required";
    if (!creator.trim()) return "Creator name is required";
    if (!goal || goal <= 0) return "Please set a valid goal amount";
    if (!days || days <= 0) return "Please set a valid duration";
    return null;
  };

  const handleSave = (publish = false) => {
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setError(null);
    // Persist campaign in localStorage under the current wallet address
    const newCampaign = {
      id: Date.now().toString(),
      title,
      creator,
      image: image || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop",
      category,
      goal,
      raised: 0,
      daysLeft: days,
    };

    try {
      const key = `sf_campaigns_${creator}`;
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      existing.push(newCampaign);
      localStorage.setItem(key, JSON.stringify(existing));
    } catch (e) {
      console.error("Failed to save campaign:", e);
    }

    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
    window.alert(publish ? "Campaign published (simulated)" : "Draft saved (simulated)");
  };

  return (
    <div className="container py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold">Start a campaign</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-prose">
            Create a compelling campaign to share with backers. Fill in the details below and preview how it will look.
          </p>

          <div className="mt-8 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Campaign title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="A short, memorable title" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Creator name</label>
                <Input value={creator} readOnly disabled className="bg-muted/10" placeholder="Connect your wallet to autofill" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select className="w-full rounded-md border border-input px-3 py-2 bg-background" value={category} onChange={(e) => setCategory(e.target.value as any)}>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Short image URL</label>
              <Input value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://example.com/photo.jpg" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Goal amount (ETH)</label>
                <Input type="number" step="0.01" value={String(goal)} onChange={(e) => setGoal(Number(parseFloat(e.target.value) || 0))} placeholder="e.g. 1.5" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Duration (days)</label>
                <Input type="number" value={String(days)} onChange={(e) => setDays(Number(e.target.value))} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Story / Description</label>
              <textarea rows={6} value={""} readOnly className="w-full rounded-md border border-input px-3 py-2 bg-background text-sm text-muted-foreground" placeholder="You can write a longer description here (not implemented in this demo)." />
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <div className="flex items-center gap-3">
              <Button className="bg-foreground text-background" onClick={() => handleSave(true)}>Create Campaign</Button>
              <Button className="bg-muted text-muted-foreground" onClick={() => handleSave(false)}>Save draft</Button>
              {saved && <span className="text-sm text-emerald-600">Saved</span>}
            </div>
          </div>
        </div>

        <aside className="lg:col-span-1">
          <h2 className="text-lg font-semibold">Preview</h2>
          <div className="mt-4">
            <Card>
              <div className="p-0">
                <CampaignCard campaign={preview} />
              </div>
            </Card>
          </div>

          <div className="mt-6 text-sm text-muted-foreground">
            <p>Tips: Use a clear hero image, concise title, and realistic funding goals.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
