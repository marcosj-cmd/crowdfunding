import mongoose from "mongoose";

const ProcessedEventSchema = new mongoose.Schema(
  { _id: { type: String, required: true } }, // txHash-logIndex
  { timestamps: true }
);

export default mongoose.model("ProcessedEvent", ProcessedEventSchema);
 