import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";



export default function CampaignDetails() {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
 const [amount, setAmount] = useState("");
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    fetch(`/api/campaigns/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch campaign");
        return res.json();
      })
      .then(data => setCampaign(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container py-12">Loading...</div>;
  if (error) return <div className="container py-12 text-red-600">{error}</div>;
  if (!campaign) return <div className="container py-12">Campaign not found.</div>;
 
  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold">{campaign.title}</h1>
      <div className="text-sm text-muted-foreground mt-2">
        by {campaign.owner} 
      </div>
      <div className="mt-6 prose max-w-none">
        <p>{campaign.description}</p>
        {campaign.image && (
          <img src={campaign.image} alt={campaign.title} className="h-full w-full object-cover" />
        )}
      </div>
      {campaign.createdAt && (
        <div className="mt-4 text-sm text-muted-foreground">
          Created: {new Date(campaign.createdAt).toLocaleString()}
        </div>
      )}
      <div className="mt-8 flex gap-2 items-center">
        <input
          type="number"
          min="0"
          step="any"
          className="rounded-md border border-input px-3 py-2 bg-background"
          placeholder="Amount in ETH"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />
        <button className="bg-foreground text-background px-4 py-2 rounded">
          Back this project
        </button>
      </div>
    </div>
  );
}