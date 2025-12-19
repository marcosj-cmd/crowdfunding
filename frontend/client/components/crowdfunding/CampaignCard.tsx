import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { Campaign } from "@/api/backend";

 export default function CampaignCard({ campaign }: { campaign: Campaign }) {
  // Convertir strings a números
  const goal = typeof campaign.goal === 'string' ? parseFloat(campaign.goal) : campaign.goal;
  const funds = typeof campaign.funds === 'string' ? parseFloat(campaign.funds) : campaign.funds;

  // Calcular daysLeft a partir de deadline
  const daysLeft = Math.max(0, Math.floor((Number(campaign.deadline) - Date.now()) / (1000 * 60 * 60 * 24)));

  const pct = goal > 0 ? Math.min(100, Math.round((funds / goal) * 100)) : 0;


  return (
    <>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
          <img src={campaign.image} alt={campaign.title} className="h-full w-full object-cover" />
        </div>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>by {campaign.owner}</span>
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
              <div className="font-semibold">{goal} ETH</div>
              <div className="text-muted-foreground">{pct}%</div>
              <div className="text-muted-foreground">{daysLeft} days left</div>
            </div>
          </div>
          <Link to={`/campaigns/${campaign.id}`}>
            <Button className="w-full bg-foreground text-background hover:bg-foreground/90">Ver campaña</Button>
          </Link>
        </CardContent>
      </Card>

    </>
  );
}
