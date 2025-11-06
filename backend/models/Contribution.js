import mongoose from "mongoose";

const ContributionSchema = new mongoose.Schema({
  owner: { type: String },
  campaignId: { type: Number },
  amount: { type: Number },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model('Contribution', ContributionSchema);