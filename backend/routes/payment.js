// backend/routes/payment.js (development version)
import express from "express";
import Booking from "../models/Booking.js";
import auth from "../middleware/auth.js";
const router = express.Router();

/**
 * Dev payment route: marks booking as paid immediately
 * No real bank needed.
 */
router.post("/create",auth, async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    // Simulate payment success
    booking.paymentStatus = "paid";
    booking.transactionId = "DEV-" + Date.now();
    await booking.save();

    // Redirect frontend to success page
    res.json({
      paymentUrl: `http://localhost:3000/success/${bookingId}`,
      params: {}, // no real params needed
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
