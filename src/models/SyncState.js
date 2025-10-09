// src/models/SyncState.js
import mongoose from "mongoose";

const SyncStateSchema = new mongoose.Schema({
  _id: { type: String, default: "latest" },  // clave única
  lastBlock: { type: Number, required: true },
});

export default mongoose.model("SyncState", SyncStateSchema);
