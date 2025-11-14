// backend/routes/qr.js
import express from "express";
import Booking from "../models/Booking.js";
import crypto from "crypto";
const router = express.Router();

// validate QR payload (posted by admin scanner)
router.post("/validate", async (req, res) => {
  try {
    const { qrPayload } = req.body; // expected JSON string or object
    const payload = typeof qrPayload === "string" ? JSON.parse(qrPayload) : qrPayload;
    const { bookingRef, ts, sig } = payload;

    const secret = process.env.JWT_SECRET; // or a dedicated QR secret
    const expected = crypto.createHmac("sha256", secret).update(JSON.stringify({ bookingRef, ts })).digest("hex");
    if (expected !== sig) return res.json({ status: "invalid", msg: "Signature mismatch" });

    const booking = await Booking.findOne({ bookingRef });
    if (!booking) return res.json({ status: "invalid", msg: "Booking not found" });

    if (booking.paymentStatus !== "paid") return res.json({ status: "invalid", msg: "Not paid" });
    if (booking.usedAt) return res.json({ status: "used", msg: `Already used at ${booking.usedAt}` });

    // mark as used
    booking.usedAt = new Date();
    await booking.save();
    return res.json({ status: "valid", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", error: err.message });
  }
});

export default router;
