import path from "path";
import "dotenv/config";
import * as express from "express";
import express__default from "express";
import cors from "cors";
const handleDemo = (req, res) => {
  const response = {
    message: "Hello from Express server"
  };
  res.status(200).json(response);
};
const SAMPLE_PROJECTS = Array.from({ length: 24 }).map((_, i) => ({
  id: String(i + 1),
  title: `Project ${i + 1}`,
  creator: `Creator ${i % 5 + 1}`,
  category: ["Art", "Tech", "Music", "Games"][i % 4],
  description: `This is a description for project ${i + 1}.`,
  createdAt: new Date(Date.now() - i * 1e3 * 60 * 60 * 24).toISOString()
}));
const handleProjects = (req, res) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10));
    const limit = Math.max(1, Math.min(100, parseInt(String(req.query.limit ?? "10"), 10)));
    const category = (req.query.category ?? "").toString().trim();
    const q = (req.query.q ?? "").toString().trim();
    let items = SAMPLE_PROJECTS.slice();
    if (category && category !== "All") {
      items = items.filter((p) => p.category === category);
    }
    if (q) {
      const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(safe, "i");
      items = items.filter((p) => re.test(p.title) || re.test(p.creator) || p.category && re.test(p.category) || p.description && re.test(p.description));
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
function createServer() {
  const app2 = express__default();
  app2.use((req, res, next) => {
    const origin = req.headers.origin || "*";
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    if (req.method === "OPTIONS") {
      if (req.headers["access-control-request-private-network"]) {
        res.setHeader("Access-Control-Allow-Private-Network", "true");
      }
      return res.sendStatus(204);
    }
    next();
  });
  app2.use(cors());
  app2.use(express__default.json());
  app2.use(express__default.urlencoded({ extended: true }));
  app2.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });
  app2.get("/api/demo", handleDemo);
  app2.get("/api/projects", handleProjects);
  return app2;
}
const app = createServer();
const port = process.env.PORT || 3e3;
const __dirname = import.meta.dirname;
const distPath = path.join(__dirname, "../spa");
app.use(express.static(distPath));
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  res.sendFile(path.join(distPath, "index.html"));
});
app.listen(port, () => {
  console.log(`🚀 Fusion Starter server running on port ${port}`);
  console.log(`📱 Frontend: http://localhost:${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
});
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});
process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
//# sourceMappingURL=node-build.mjs.map
