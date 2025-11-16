import express from "express";
import Campaign from "../models/Campaign.js";
import { paginate } from "../utils/pagination.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const campaigns = await Campaign.find().sort({ createdAt: -1 });
  res.json(campaigns);
});

// GET /api/campaigns/paginated?page=1&limit=10&owner=0x...&withdrawn=true
router.get("/paginated", async (req, res) => {
  try {
    // Construir filtros
    const query = {};
    if (req.query.owner) {
      query.owner = new RegExp(`^${req.query.owner}$`, 'i');
    }
    if (typeof req.query.withdrawn !== "undefined") {
      if (req.query.withdrawn === "true") query.withdrawn = true;
      if (req.query.withdrawn === "false") query.withdrawn = false;
    }

    // Usar helper de paginación
    const result = await paginate(req, Campaign, query);

    res.json(result);
  } catch (err) {
    console.error("Error paginación de campañas:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.get("/:id", async (req, res) => {
  const campaign = await Campaign.findOne({ id: req.params.id });
  res.json(campaign);
});



export default router;