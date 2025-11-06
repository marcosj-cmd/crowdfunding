import express from "express";
import Campaign from "../models/Campaign.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const campaigns = await Campaign.find().sort({ createdAt: -1 });
  res.json(campaigns);
});

// GET /api/campaigns/paginated?page=1&limit=10&sort=desc&owner=0x...&withdrawn=true
router.get("/paginated", async (req, res) => {
  try {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 100, 1), 100);


    const query = {};
    if (req.query.owner) {
      // Búsqueda case-insensitive para direcciones Ethereum
      query.owner = new RegExp(`^${req.query.owner}$`, 'i');
    }
    if (typeof req.query.withdrawn !== "undefined") {
      if (req.query.withdrawn === "true") query.withdrawn = true;
      if (req.query.withdrawn === "false") query.withdrawn = false;
    }

    const total = await Campaign.countDocuments(query);
    const totalPages = Math.max(Math.ceil(total / limit), 1);
    const safePage = Math.min(page, totalPages);
    const skip = (safePage - 1) * limit;

    const items = await Campaign.find(query)
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      page: safePage,
      limit,
      total,
      totalPages,
      hasPrev: safePage > 1,
      hasNext: safePage < totalPages,
      items,
    });
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