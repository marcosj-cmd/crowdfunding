import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import campaignsRoute from "./routes/campaigns.js";
import contributionsRouter from "./routes/contributions.js";
import { startListener, syncPastEvents } from "./listener.js";
dotenv.config();


const app = express();
app.use(express.json());

app.use("/api/campaigns", campaignsRoute);
app.use("/api", contributionsRouter);

// Static frontend serving (prefer built SPA in public/dist/spa)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, "../public");
const spaBuiltDir = path.join(publicDir, "dist", "spa");
const staticDir = fs.existsSync(path.join(spaBuiltDir, "index.html")) ? spaBuiltDir : publicDir;
app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.use(express.static(staticDir));

// SPA fallback: send index.html for non-API routes
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(staticDir, "index.html"));
});

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ Conectado a MongoDB");
    await syncPastEvents();  // primero recorre lo viejo (hasta head)
    await startListener();   // luego escucha lo nuevo
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () =>
      console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT} (sirviendo estáticos desde ${staticDir})`)
    );
  })
  .catch(err => console.error("❌ Error de conexión a MongoDB:", err));