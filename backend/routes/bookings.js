// backend/routes/bookings.js
import express from "express";
import Booking from "../models/Booking.js";
import Event from "../models/Event.js";
import User from "../models/User.js";
import auth from "../middleware/auth.js";
import crypto from "crypto";
import QRCode from "qrcode";
import { generateTicketPDFAndSend, generateTicketPDFBuffer } from "../utils/ticket.js";
import cloudinary from "../config/cloudinary.js";
import upload from "../middleware/upload.js";
import streamifier from "streamifier";

const router = express.Router();

/* ----------------------------
   existing: create booking
   ---------------------------- */
router.post("/", auth, async (req, res) => {
  try {
    const { tickets, plus1Name } = req.body;

    // Load user
    const user = await User.findById(req.user.id)
      .select("firstName lastName class contactNumber");

    if (!user) return res.status(400).json({ msg: "User not found" });

    const attendeeName = `${user.firstName} ${user.lastName}`;
    const className = user.class;
    const contactNumber = user.contactNumber;

    // Load event
    const event = await Event.findOne({});
    if (!event) return res.status(400).json({ msg: "Event not configured" });

    const numTickets = tickets === 2 ? 2 : 1;
    const amount = event.price * numTickets;

    // Generate bookingRef
    const lastBooking = await Booking.findOne().sort({ createdAt: -1 });
    let nextNumber = 1;
    if (lastBooking?.bookingRef) {
      const lastNum = parseInt(lastBooking.bookingRef.replace("ET-C", ""));
      if (!isNaN(lastNum)) nextNumber = lastNum + 1;
    }
    const bookingRef = `ET-C${String(nextNumber).padStart(3, "0")}`;

    // Create booking
    const booking = new Booking({
      user: req.user.id,
      attendeeName,
      class: className,        // <-- NEW
      contactNumber,
      plus1Name: tickets === 2 ? plus1Name : undefined,
      tickets: numTickets,
      amount,
      bookingRef,
    });

    // QR
    const payload = { bookingRef, ts: Date.now() };
    const hmac = crypto.createHmac("sha256", process.env.JWT_SECRET)
      .update(JSON.stringify(payload))
      .digest("hex");

    booking.qrCodeData = JSON.stringify({ ...payload, sig: hmac });

    await booking.save();

    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});





/* ----------------------------
   existing: get bookings for user
   ---------------------------- */
router.get("/user", auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ----------------------------
   Upload receipt (Bank transfer)
   POST /api/bookings/:id/upload-receipt
   - auth required (user)
   - file in `receipt` form field (image/pdf)
   - stores receiptUrl, receiptPublicId, receiptStatus="pending"
   ---------------------------- */
router.post("/:id/upload-receipt", auth, upload.single("receipt"), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    // Only owner can upload
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    if (!req.file) return res.status(400).json({ msg: "No file uploaded" });

    // Determine Cloudinary resource type based on file type
    const isPDF = req.file.mimetype === "application/pdf";
    const resourceType = isPDF ? "raw" : "auto";

    // Preserve original filename + extension
    const originalName = req.file.originalname.replace(/\s+/g, "_"); // remove spaces
    const publicId = `reunion_receipts/${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 5)}_${originalName}`;

    // upload buffer to Cloudinary via upload_stream
    const bufferStream = streamifier.createReadStream(req.file.buffer);
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "reunion_receipts",
          resource_type: resourceType,
          public_id: publicId,
          use_filename: false,
          unique_filename: false,
          overwrite: false,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      bufferStream.pipe(uploadStream);
    });

    // Save Cloudinary info to booking
    booking.receiptUrl = uploadResult.secure_url;
    booking.receiptPublicId = uploadResult.public_id;
    booking.receiptStatus = "pending";
    booking.receiptUploadedAt = new Date();
    await booking.save();

    res.json({
      msg: "Receipt uploaded and awaiting verification",
      receiptUrl: booking.receiptUrl,
      booking,
    });
  } catch (err) {
    console.error("Upload receipt error:", err);
    res.status(500).json({ error: err.message || err.toString() });
  }
});

/* ----------------------------
   Admin verifies or rejects a receipt
   POST /api/bookings/:id/verify-receipt
   body: { action: 'approve'|'reject', note?: string }
   requires auth and req.user.isAdmin === true
   ---------------------------- */
router.post("/:id/verify-receipt", auth, async (req, res) => {
  try {
    // require admin
    if (!req.user.isAdmin) return res.status(403).json({ msg: "Admin only" });

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    const { action, note } = req.body;
    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ msg: "Invalid action" });
    }

    if (action === "approve") {
      booking.receiptStatus = "verified";
      // Mark booking as paid automatically? optional — decision: mark as paid
      booking.paymentStatus = "paid";
      booking.transactionId = "MANUAL-" + Date.now();
    } else {
      booking.receiptStatus = "rejected";
    }
    booking.receiptNote = note || "";
    await booking.save();

    // if approved: regenerate + email ticket (async, but catch errors)
    if (action === "approve") {
      try {
        await generateTicketPDFAndSend(booking);
      } catch (err) {
        console.error("Failed to generate/send ticket after approval:", err.message);
      }
    }

    res.json({ msg: "Receipt processed", booking });
  } catch (err) {
    console.error("Verify receipt error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ----------------------------
   existing: add plus one (keeps QR regen)
   ---------------------------- */
router.post("/:id/add-plusone", auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ msg: "Booking not found" });
    if (booking.tickets === 2) return res.status(400).json({ msg: "Already has plus one" });

    const event = await Event.findOne({});
    if (!event) return res.status(400).json({ msg: "Event not configured" });

    booking.tickets = 2;
    booking.plus1Name = req.body.plus1Name;
    booking.amount = event.price * 2;
    booking.paymentStatus = "pending";

    const payload = { bookingRef: booking.bookingRef, ts: Date.now() };
    const secret = process.env.JWT_SECRET;
    const hmac = crypto.createHmac("sha256", secret).update(JSON.stringify(payload)).digest("hex");
    const qrPayload = { ...payload, sig: hmac };
    booking.qrCodeData = JSON.stringify(qrPayload);

    // If there was a prior receipt, invalidate it (mark rejected) - recommended
    if (booking.receiptPublicId) {
      // Optionally remove from cloudinary OR mark as rejected
      booking.receiptStatus = "none";
      booking.receiptUrl = undefined;
      booking.receiptPublicId = undefined;
      booking.receiptUploadedAt = undefined;
      booking.receiptNote = "Invalidated due to booking update (plus one added).";
    }

    await booking.save();
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/* ----------------------------
   existing: get booking by id
   ---------------------------- */
router.get("/:id", auth, async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  res.json(booking);
});

/* ----------------------------
   existing: mark-paid (dev)
   ---------------------------- */
router.post("/:id/mark-paid", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    booking.paymentStatus = "paid";
    booking.transactionId = "DEV-" + Date.now();
    await booking.save();

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

/* ----------------------------
   existing: download ticket
   ---------------------------- */
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
