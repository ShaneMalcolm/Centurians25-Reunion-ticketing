// backend/routes/webhook.js
import express from "express";
import Booking from "../models/Booking.js";
import crypto from "crypto";
import { generateTicketPDFAndSend } from "../utils/ticket.js";
import User from "../models/User.js";

const router = express.Router();

// This endpoint is invoked by the bank after payment or via async IPN
router.post("/payment-callback", async (req, res) => {
  // bank will send POST with many fields; we'll validate signature/hash and update booking
  try {
    const body = req.body; // incoming POST fields from bank
    // Example expected fields (replace names with bank's spec)
    const { order_id, amount, currency, status, transaction_id, signature } = body;

    // verify signature/hash — use merchant key and bank's spec
    const merchantKey = process.env.CB_MERCHANT_KEY;
    const hashString = `${order_id}|${amount}|${currency}|${status}`; // example
    const expectedSig = crypto.createHmac("sha256", merchantKey).update(hashString).digest("hex");

    if (expectedSig !== signature) {
      console.error("Signature mismatch");
      return res.status(400).send("Invalid signature");
    }

    // find booking
    const booking = await Booking.findOne({ bookingRef: order_id });
    if (!booking) return res.status(404).send("Booking not found");

    if (status === "SUCCESS" || status === "PAID") {
      booking.paymentStatus = "paid";
      booking.transactionId = transaction_id;
      booking.paymentResponse = body;
      await booking.save();

      // fetch user email
      const user = await User.findById(booking.user);
      // generate ticket PDF and send to user email
      await generateTicketPDFAndSend({ ...booking.toObject(), user: user.email, attendeeName: booking.attendeeName });
      return res.status(200).send("OK");
    } else {
      booking.paymentStatus = "failed";
      booking.paymentResponse = body;
      await booking.save();
      return res.status(200).send("Payment failed");
    }
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).send("Server error");
  }
});

export default router;
