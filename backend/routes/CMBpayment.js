// backend/routes/payment.js
import express from "express";
import Booking from "../models/Booking.js";
import crypto from "crypto";
import auth from "../middleware/auth.js";
const router = express.Router();

/**
 * This route builds the payment parameters required by Commercial Bank IPG.
 * The exact parameter names and hashing algorithm must be replaced according to the bank's integration guide.
 *
 * Typical flow:
 *  - User creates booking -> booking record with paymentStatus "pending"
 *  - Frontend calls this endpoint with bookingId
 *  - Server returns a form (or url + params) which the frontend posts to the bank payment URL
 */

router.post("/create",auth, async (req, res) => {
  try {
    const { bookingId, returnUrl } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    const merchantId = process.env.CB_MERCHANT_ID;
    const merchantKey = process.env.CB_MERCHANT_KEY;
    const amount = booking.amount; // LKR
    const orderId = booking.bookingRef; // unique order id
    const currency = "LKR";

    // Example param set — replace these with real param names required by Commercial Bank.
    const params = {
      merchant_id: merchantId,
      order_id: orderId,
      amount: amount.toString(),
      currency,
      return_url: returnUrl || `${process.env.BACKEND_URL}/api/webhook/payment-return`,
      // other optional params (customer details) can be added per bank docs
    };

    // Create secure hash / signature. The exact string format to hash is dependent on the bank.
    // This example uses HMAC-SHA256 over concatenated values.
    const hashString = `${params.merchant_id}|${params.order_id}|${params.amount}|${params.currency}`;
    const signature = crypto.createHmac("sha256", merchantKey).update(hashString).digest("hex");
    params.signature = signature;

    // Return params and payment endpoint to frontend which will submit to bank
    res.json({ paymentUrl: process.env.CB_PAYMENT_URL, params });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
