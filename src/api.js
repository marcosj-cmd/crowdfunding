import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import campaignsRouter from "./routes/campaigns.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🧱 Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB (API)"))
  .catch(err => console.error("❌ Error conectando a MongoDB:", err));

// 📦 Montar el router de campañas
app.use("/api/campaigns", campaignsRouter);

