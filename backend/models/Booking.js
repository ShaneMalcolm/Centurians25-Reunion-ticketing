// backend/models/Booking.js
import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  attendeeName: { type: String, required: true },
  contactNumber: { type: String, required: true },
  plus1Name: { type: String }, // <-- add this
  tickets: { type: Number, enum: [1,2], default: 1 },
  amount: Number,
  bookingRef: { type: String, unique: true },
  paymentStatus: { type: String, enum: ["pending","paid","failed","cancelled"], default: "pending" },
  transactionId: String,
  paymentResponse: Object,
  qrCodeData: String,
  usedAt: Date
}, { timestamps: true });


export default mongoose.model("Booking", BookingSchema);
