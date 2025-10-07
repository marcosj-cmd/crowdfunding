import mongoose from "mongoose";

const CampaignSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  owner: String,
  goal: String,
  funds: Number,
  deadline: Number,
  withdrawn: Boolean
}, { timestamps: true });

export default mongoose.model("Campaign", CampaignSchema);