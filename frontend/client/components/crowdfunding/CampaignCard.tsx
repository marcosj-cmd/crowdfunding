import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ethers } from "ethers";



 export type Campaign = {
   id: number;
   title: string;
   owner: string;
   image: string;
   category: string;
   goal: number;
   funds: number;
   deadline: number;
 };

 export default function CampaignCard({ campaign }: { campaign: Campaign }) {
  const [raised, setRaised] = useState<number>(campaign.funds|| 0);

  // Calcular daysLeft y fecha a partir de deadline

  const daysLeft = Math.max(0, Math.floor((Number(campaign.deadline) - Date.now()) / (1000 * 60 * 60 * 24)));
  const fecha = new Date(Number(campaign.deadline) * 1000);

const pct = campaign.goal > 0 ? Math.min(100, Math.round((campaign.funds / campaign.goal) * 100)) : 0;


  return (
    <>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
          <img src={campaign.image} alt={campaign.title} className="h-full w-full object-cover" />
        </div>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 px-2 py-0.5">{campaign.category}</span>
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
            <div className="font-semibold">{Number(campaign.goal)} ETH</div>
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
