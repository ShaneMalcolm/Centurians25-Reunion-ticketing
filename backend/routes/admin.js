import express from "express";
import Booking from "../models/Booking.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import authMiddleware from "../middleware/auth.js";
import { generateTicketPDFAndSend } from "../utils/ticket.js";

const router = express.Router();

// -----------------------------------------------------
// GET ALL BOOKINGS (Admin only)
// -----------------------------------------------------
router.get("/bookings", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------
// APPROVE BOOKING (mark as paid + send ticket)
// -----------------------------------------------------
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

      await generateTicketPDFAndSend(booking); // <--- sends email with ticket

      res.json({ msg: "Booking approved & ticket sent", booking });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
