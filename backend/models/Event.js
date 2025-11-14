// backend/models/Event.js
import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: Date,
  venue: String,
  price: { type: Number, default: 0 }, // base price for single ticket (LKR)
  bannerUrl: String
}, { timestamps: true });

export default mongoose.model("Event", EventSchema);
