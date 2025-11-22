// backend/routes/bookings.js
import express from "express";
import Booking from "../models/Booking.js";
import Event from "../models/Event.js";
import User from "../models/User.js";
import auth from "../middleware/auth.js";
import crypto from "crypto";
import QRCode from "qrcode";
import { generateTicketPDFAndSend, generateTicketPDFBuffer } from "../utils/ticket.js";

const router = express.Router();

// create booking
router.post("/", auth, async (req, res) => {
  try {
    const { attendeeName, contactNumber, tickets, plus1Name } = req.body;
    const event = await Event.findOne({});
    if (!event) return res.status(400).json({ msg: "Event not configured" });

    const numTickets = tickets === 2 ? 2 : 1;
    const amount = event.price * numTickets;

    const bookingRef = "RB-" + crypto.randomBytes(6).toString("hex").toUpperCase();

    const booking = new Booking({
      user: req.user.id,
      attendeeName,
      contactNumber,
      plus1Name: tickets === 2 ? plus1Name : undefined, // save only if plus1
      tickets: numTickets,
      amount,
      bookingRef,
    });

    const payload = { bookingRef, ts: Date.now() };
    const secret = process.env.JWT_SECRET;
    const hmac = crypto.createHmac("sha256", secret).update(JSON.stringify(payload)).digest("hex");
    const qrPayload = { ...payload, sig: hmac };
    booking.qrCodeData = JSON.stringify(qrPayload);

    await booking.save();

    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// add Plus 1 to an existing booking (pay extra)
router.post("/:id/add-plusone", auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ msg: "Booking not found" });
    if (booking.tickets === 2) return res.status(400).json({ msg: "Already has plus one" });

    const event = await Event.findOne({});
    booking.tickets = 2;
    booking.amount = event.price * 2;
    booking.paymentStatus = "pending"; // re-pay
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get booking by id (for users/admin)
router.get("/:id", auth, async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  res.json(booking);
});

// endpoint to regenerate ticket PDF and email (admin/users)
router.post("/:id/send-ticket", auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    // regenerate and send ticket (only for paid bookings)
    if (booking.paymentStatus !== "paid") return res.status(400).json({ msg: "Booking not paid" });

    await generateTicketPDFAndSend(booking);
    res.json({ msg: "Ticket sent" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DEV ONLY: mark booking as paid
 * Updates paymentStatus, generates ticket PDF, and sends email to user.
 */
router.post("/:id/mark-paid", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    booking.paymentStatus = "paid";
    booking.transactionId = "DEV-" + Date.now();
    await booking.save();

    // Fetch user to ensure email exists
    const user = await User.findById(booking.user);
    if (!user || !user.email) {
      console.warn(`Booking ${booking._id} paid, but user email missing.`);
      return res.json({ msg: "Booking marked as paid, but no email sent", booking });
    }

    try {
      await generateTicketPDFAndSend(booking);
      console.log(`Ticket for booking ${booking._id} emailed to ${user.email}`);
      res.json({ msg: "Booking marked as paid and ticket emailed", booking });
    } catch (emailErr) {
      console.error(`Ticket/email sending failed for booking ${booking._id}:`, emailErr.message);
      res.json({
        msg: "Booking marked as paid, but ticket/email sending failed",
        booking,
        error: emailErr.message,
      });
    }

  } catch (err) {
    console.error("Error marking booking as paid:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Download ticket PDF
router.get("/:id/ticket", auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ msg: "Booking not found" });
    if (booking.paymentStatus !== "paid")
      return res.status(400).json({ msg: "Booking not paid yet" });

    const event = await Event.findOne({});
    if (!event) return res.status(404).json({ msg: "Event not found" });

    const user = await User.findById(booking.user);
    if (!user || !user.email)
      return res.status(404).json({ msg: "User email not found" });

    const pdfBuffer = await generateTicketPDFBuffer(booking, event, user);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=ticket_${booking.bookingRef}.pdf`,
      "Content-Length": pdfBuffer.length,
    });

    res.send(pdfBuffer);
  } catch (err) {
    console.error("Error generating ticket for download:", err.message);
    res.status(500).json({ msg: "Failed to generate ticket" });
  }
});

export default router;
