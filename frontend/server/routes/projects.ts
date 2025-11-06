import { RequestHandler } from "express";

type Project = {
  id: string;
  title: string;
  creator: string;
  category?: string;
  description?: string;
  createdAt: string;
};

const SAMPLE_PROJECTS: Project[] = Array.from({ length: 24 }).map((_, i) => ({
  id: String(i + 1),
  title: `Project ${i + 1}`,
  creator: `Creator ${((i % 5) + 1)}`,
  category: ["Art", "Tech", "Music", "Games"][i % 4],
  description: `This is a description for project ${i + 1}.`,
  createdAt: new Date(Date.now() - i * 1000 * 60 * 60 * 24).toISOString(),
}));

export const handleProjects: RequestHandler = (req, res) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10));
    const limit = Math.max(1, Math.min(100, parseInt(String(req.query.limit ?? "10"), 10)));
    const category = (req.query.category ?? "").toString().trim();
    const q = (req.query.q ?? "").toString().trim();

    // Build filter
    let items = SAMPLE_PROJECTS.slice();
    if (category && category !== "All") {
      items = items.filter((p) => p.category === category);
    }
    if (q) {
      const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(safe, "i");
      items = items.filter((p) => re.test(p.title) || re.test(p.creator) || (p.category && re.test(p.category)) || (p.description && re.test(p.description)));
    }

    const total = items.length;
    const start = (page - 1) * limit;
    const paginated = items.slice(start, start + limit);

    res.json({ items: paginated, total });
  } catch (err) {
    console.error("Projects handler error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
