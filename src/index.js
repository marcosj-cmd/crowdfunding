import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import campaignsRoute from "./routes/campaigns.js";
import { startListener } from "./listener.js";

dotenv.config();
require('./listener')
const app = express();
app.use(express.json());

app.use("/api/campaigns", campaignsRoute);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Conectado a MongoDB");
    startListener();
    app.listen(process.env.PORT, () =>
      console.log(`🚀 Servidor ejecutándose en http://localhost:${process.env.PORT}`)
    );
  })
  .catch(err => console.error("❌ Error de conexión a MongoDB:", err));