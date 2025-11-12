import mongoose from "mongoose";

const CampaignSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  owner: String,
  title: String,        // Del evento CampaignCreated
  description: String,  // Del evento CampaignCreated
  goal: Number,
  funds: Number,
  deadline: Number,
  daysLeft: Number,
  withdrawn: Boolean,
  metadataUri: String,  // URI de IPFS con metadata completa
  image: String         // URL HTTP de la imagen parseada desde IPFS
}, { timestamps: true });

export default mongoose.model("Campaign", CampaignSchema);