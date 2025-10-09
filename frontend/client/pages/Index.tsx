import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CampaignCard, { type Campaign } from "@/components/crowdfunding/CampaignCard";

const campaignsSeed: Campaign[] = [
  { id: "1", title: "Modular, solar-powered backpack for creators", creator: "Lena Park", image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop", category: "Design", goal: 50000, raised: 34000, daysLeft: 21 },
  { id: "2", title: "Handmade ceramic cookware set", creator: "Atelier Ko", image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop", category: "Craft", goal: 30000, raised: 26000, daysLeft: 12 },
  { id: "3", title: "Open-source e‑ink notepad", creator: "OpenInk Lab", image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1200&auto=format&fit=crop", category: "Tech", goal: 120000, raised: 89000, daysLeft: 18 },
  { id: "4", title: "City garden micro‑farm initiative", creator: "GreenGrid", image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200&auto=format&fit=crop", category: "Community", goal: 45000, raised: 41000, daysLeft: 9 },
  { id: "5", title: "Indie strategy game: Dawn of Isles", creator: "PixelForge", image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop", category: "Games", goal: 150000, raised: 132000, daysLeft: 27 },
  { id: "6", title: "Photobook: Portraits of Tomorrow", creator: "Noah Diaz", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop", category: "Art", goal: 20000, raised: 17200, daysLeft: 6 },
];

const categories = ["All", "Tech", "Design", "Art", "Community", "Games", "Craft"] as const;

export default function Index() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<(typeof categories)[number]>("All");

  const filtered = useMemo(() => {
    return campaignsSeed.filter((c) => {
      const matchesQuery = [c.title, c.creator, c.category]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesCat = active === "All" || c.category === active;
      return matchesQuery && matchesCat;
    });
  }, [query, active]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.25),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(20,184,166,0.25),transparent_40%)]" />
        <div className="container py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
              Fund bold ideas, together
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Discover promising projects and help founders bring their vision to life. Back what you believe in.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Search campaigns, creators, categories..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-12"
                />
              </div>
              <Button className="h-12 px-6 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white">
                Search
              </Button>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-6 max-w-xl text-sm">
              <div>
                <div className="text-2xl font-extrabold">$398M</div>
                <div className="text-muted-foreground">raised by backers</div>
              </div>
              <div>
                <div className="text-2xl font-extrabold">1.2M</div>
                <div className="text-muted-foreground">community members</div>
              </div>
              <div>
                <div className="text-2xl font-extrabold">24k</div>
                <div className="text-muted-foreground">successful campaigns</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="border-t border-b bg-card/50">
        <div className="container py-4 flex flex-wrap items-center gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={
                "px-3 py-1.5 rounded-full text-sm transition-colors border " +
                (active === c
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900"
                  : "bg-background text-muted-foreground hover:text-foreground")
              }
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section>
        <div className="container py-10">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-xl md:text-2xl font-bold">Featured campaigns</h2>
            <a href="/my-campaigns" className="text-sm text-muted-foreground hover:text-foreground">See all</a>
          </div>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
