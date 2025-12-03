// backend/models/Booking.js
import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  attendeeName: { type: String, required: true },
  contactNumber: { type: String, required: true },
  plus1Name: { type: String },
  tickets: { type: Number, enum: [1,2], default: 1 },
  amount: Number,
  bookingNumber: Number,
  bookingRef: { type: String, unique: true },
  paymentStatus: { type: String, enum: ["pending","paid","failed","cancelled"], default: "pending" },
  transactionId: String,
  paymentResponse: Object,
  qrCodeData: String,
  usedAt: Date,

  // -------------------------
  // Receipt upload fields
  // -------------------------
  receiptUrl: { type: String }, // Cloudinary secure URL
  receiptPublicId: { type: String }, // Cloudinary public_id (for deletion if needed)
  receiptStatus: { type: String, enum: ["none","pending","verified","rejected"], default: "none" },
  receiptNote: { type: String }, // admin note when verifying/rejecting
  receiptUploadedAt: Date,
}, { timestamps: true });

export default mongoose.model("Booking", BookingSchema);
