import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import CampaignCard, { type Campaign } from "@/components/crowdfunding/CampaignCard";

const PAGE_LIMIT = 9;

async function fetchProjects(page: number, limit = PAGE_LIMIT, base = "") {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));

  const url = `${base}/api/campaigns/paginated?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to fetch projects (${res.status})`);
  }
  const json = await res.json();
  const items: Campaign[] = json.data || json.items || json.projects || (Array.isArray(json) ? json : []);
  const total: number | null = typeof json.total === "number" ? json.total : null;
  return { items, total };
}

export default function Index() {
  const [page, setPage] = useState(1);

  const apiBase = import.meta.env.VITE_API_BASE ?? "";

 const { data, isLoading, isError, isFetching } = useQuery({
  queryKey: ["projects", page],
  queryFn: () => fetchProjects(page, PAGE_LIMIT, apiBase),
  placeholderData: (prev) => prev,
  staleTime: 1000 * 30,
});

  const projects = data?.items ?? [];
  const total = data?.total ?? null;

  const totalPages = total ? Math.max(1, Math.ceil(total / PAGE_LIMIT)) : null;
  const hasNext = totalPages ? page < totalPages : projects.length === PAGE_LIMIT;

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

      {/* Grid */}
      <section>
        <div className="container py-10">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-xl md:text-2xl font-bold">Featured campaigns</h2>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              {isLoading ? (
                <span>Loading...</span>
              ) : isError ? (
                <span>Error loading projects</span>
              ) : (
                <>
                  <span>Page {page}{totalPages ? ` of ${totalPages}` : ''}</span>
                  <button
                    aria-label="previous page"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 rounded-md bg-background border"
                  >
                    ‹
                  </button>
                  <button
                    aria-label="next page"
                    onClick={() => { if (hasNext) setPage((p) => p + 1); }}
                    disabled={!hasNext}
                    className="px-3 py-1 rounded-md bg-background border"
                  >
                    ›
                  </button>
                </>
              )}
              {isFetching && <span className="ml-2 text-sm">Updating…</span>}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
