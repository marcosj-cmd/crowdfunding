import express from "express";
import Campaign from "../models/Campaign.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const campaigns = await Campaign.find().sort({ createdAt: -1 });
  res.json(campaigns);
});

router.get("/:id", async (req, res) => {
  const campaign = await Campaign.findOne({ id: req.params.id });
  res.json(campaign);
});

export default router;