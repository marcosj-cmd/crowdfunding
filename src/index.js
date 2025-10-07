import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import campaignsRoute from "./routes/campaigns.js";
import { startListener } from "./listener.js";
import { syncPastEvents } from "./syncPastEvents.js";
dotenv.config();

const app = express();
app.use(express.json());

app.use("/api/campaigns", campaignsRoute);

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ Conectado a MongoDB");
    await syncPastEvents();  // primero recorre lo viejo (hasta head)
    await startListener();   // luego escucha lo nuevo
    app.listen(process.env.PORT, () =>
      console.log(`🚀 Servidor ejecutándose en http://localhost:${process.env.PORT}`)
    );
  })
  .catch(err => console.error("❌ Error de conexión a MongoDB:", err));