import express from "express";
import Contribution from "../models/Contribution.js";
import Campaign from "../models/Campaign.js";
import { paginate } from "../utils/pagination.js";

const router = express.Router();

// GET /api/contributions?owner=0x...
router.get("/contributions", async (req, res) => {
  try {
    let filter = {};
    if (req.query.owner) {
      filter.owner = new RegExp(`^${req.query.owner}$`, 'i');
    }
    const contributions = await Contribution.find(filter);
    const result = contributions.map(c => ({
      campaignId: c.campaignId,
      amount: c.amount,
      date: c.timestamp,
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Error fetching contributions" });
  }
});

// GET /api/contributions/paginated?page=1&limit=10&owner=0x...
router.get("/contributions/paginated", async (req, res) => {
  try {
    // Construir filtros
    const query = {};
    if (req.query.owner) {
      query.owner = new RegExp(`^${req.query.owner}$`, 'i');
    }
    if (req.query.campaignId) {
      query.campaignId = parseInt(req.query.campaignId, 10);
    }

    // Usar helper de paginación
    const result = await paginate(req, Contribution, query);

    res.json(result);
  } catch (err) {
    console.error("Error paginación de contribuciones:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }   
});

export default router;
