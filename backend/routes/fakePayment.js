// backend/routes/fakePayment.js
import express from "express";
import Booking from "../models/Booking.js";
const router = express.Router();

// Simulate payment
router.post("/create", async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    // Simulate payment URL
    const fakePaymentUrl = `http://localhost:3000/fake-pay/${bookingId}`;
    const params = {}; // no real params needed

    res.json({ paymentUrl: fakePaymentUrl, params });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// backend/routes/fakePayment.js continued
router.post("/bookings/:id/mark-paid", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    booking.paymentStatus = "paid";
    await booking.save();

    res.json({ msg: "Payment successful", booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
