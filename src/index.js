import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import campaignsRoute from "./routes/campaigns.js";
import { startListener, syncPastEvents } from "./listener.js";
dotenv.config();

const app = express();
app.use(express.json());

app.use("/api/campaigns", campaignsRoute);

// ESM-safe __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Static frontend: prefer built SPA at ../public/dist/spa if available
const publicDir = path.resolve(__dirname, "../public");
const spaBuiltDir = path.join(publicDir, "dist", "spa");
const staticDir = fs.existsSync(path.join(spaBuiltDir, "index.html")) ? spaBuiltDir : publicDir;
app.use(express.static(staticDir));

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ Conectado a MongoDB");
    await syncPastEvents();  // primero recorre lo viejo (hasta head)
    await startListener();   // luego escucha lo nuevo
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () =>
      console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`)
    );
  })
  .catch(err => console.error("❌ Error de conexión a MongoDB:", err));

// SPA fallback: for any non-API GET route, serve index.html
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(staticDir, "index.html"));
});

// heroku-postbuild script
app.post('/heroku-postbuild', (req, res) => {
  const { exec } = require('child_process');
  exec('cd public && npm ci && npm run build', (err, stdout, stderr) => {
    if (err) {
      console.error(`Error during build: ${stderr}`);
      return res.status(500).send('Build failed');
    }
    console.log(`Build output: ${stdout}`);
    res.send('Build successful');
  });
});