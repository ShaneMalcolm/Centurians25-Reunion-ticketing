// backend/routes/admin.js
import express from "express";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import authMiddleware from "../middleware/auth.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import { generateTicketPDFAndSend } from "../utils/ticket.js";

const router = express.Router();

// -------------------- GET ALL BOOKINGS --------------------
router.get("/bookings", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "firstName lastName email contactNumber class")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- APPROVE BOOKING --------------------
router.patch(
  "/bookings/:id/approve",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const booking = await Booking.findById(req.params.id);
      if (!booking) return res.status(404).json({ msg: "Booking not found" });

      if (!booking.receiptUrl)
        return res.status(400).json({ msg: "Receipt not uploaded yet" });

      booking.paymentStatus = "paid";
      await booking.save();

      await generateTicketPDFAndSend(booking);

      res.json({ msg: "Booking approved & ticket sent", booking });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// -------------------- GET ALL USERS (Non-admins only) --------------------
router.get("/users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find({ isAdmin: false })
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// -------------------- MARK TICKET AS USED --------------------
router.post("/mark-used", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { qrData } = req.body;
    const booking = await Booking.findOne({ qrCodeData: qrData });

    if (!booking) return res.status(404).json({ msg: "Booking not found" });
    if (booking.used) return res.status(400).json({ msg: "Ticket already used" });

    booking.used = true;
    await booking.save();

    res.json({ msg: "Ticket marked as used", bookingRef: booking.bookingRef });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
