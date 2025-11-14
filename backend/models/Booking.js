// backend/models/Booking.js
import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  attendeeName: { type: String, required: true },
  contactNumber: String,
  tickets: { type: Number, enum: [1,2], default: 1 }, // 1 or 2 (plus1)
  amount: Number, // in LKR
  bookingRef: { type: String, unique: true },
  paymentStatus: { type: String, enum: ["pending","paid","failed","cancelled"], default: "pending" },
  transactionId: String,
  paymentResponse: Object,
  qrCodeData: String, // stored QR payload (e.g., JSON with id+hash)
  usedAt: Date // when scanned/validated
}, { timestamps: true });

export default mongoose.model("Booking", BookingSchema);
