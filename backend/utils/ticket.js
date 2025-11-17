import QRCode from "qrcode";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import Event from "../models/Event.js";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

// Initialize transporter
let transporter;

// Use real SMTP in production, fallback to Ethereal in dev
if (process.env.NODE_ENV === "development") {
  nodemailer.createTestAccount().then((testAccount) => {
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log("Using Ethereal test account for emails:", testAccount.user);
  });
} else {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  console.log("Using real SMTP:", process.env.EMAIL_USER);
}

/**
 * Generates a PDF ticket and emails it to the user.
 */
export async function generateTicketPDFAndSend(booking) {
  try {
    const event = await Event.findOne({});
    if (!event) throw new Error("Event not found");

    const user = await User.findById(booking.user);
    if (!user || !user.email) throw new Error("User email not found");

    const qrDataUrl = await QRCode.toDataURL(booking._id.toString());

    const doc = new PDFDocument({ size: "A4" });
    const tempPath = path.join(process.cwd(), `tmp_ticket_${booking._id}.pdf`);
    const stream = fs.createWriteStream(tempPath);
    doc.pipe(stream);

    doc.fontSize(20).text(event.title, { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text(`Booking ID: ${booking.bookingRef}`);
    doc.text(`Attendee: ${booking.attendeeName}`);
    doc.text(`Tickets: ${booking.tickets}`);
    doc.text(`Amount: LKR ${booking.amount}`);
    doc.text(`Status: ${booking.paymentStatus}`);
    doc.moveDown();
    doc.text(`Event: ${event.title}`);
    doc.text(`Date: ${new Date(event.date).toLocaleString()}`);
    doc.text(`Venue: ${event.venue}`);
    doc.moveDown();

    const qrImageBuffer = Buffer.from(qrDataUrl.split(",")[1], "base64");
    doc.image(qrImageBuffer, { fit: [150, 150], align: "center" });

    doc.end();
    await new Promise((resolve) => stream.on("finish", resolve));

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Your Ticket — ${event.title}`,
      text: `Hello ${booking.attendeeName},\n\nPlease find your batch party ticket attached.\nBooking ID: ${booking.bookingRef}`,
      attachments: [{ filename: "ticket.pdf", path: tempPath }],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Ticket emailed to ${user.email} successfully!`);

    if (process.env.NODE_ENV === "development") {
      console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
    }

    fs.unlinkSync(tempPath);
  } catch (err) {
    console.error("Error generating/sending ticket:", err.message);
    throw err;
  }
}

/**
 * Generates a PDF buffer for download (no email)
 */
export async function generateTicketPDFBuffer(booking, event, user) {
  try {
    const qrDataUrl = await QRCode.toDataURL(booking._id.toString());
    const doc = new PDFDocument({ size: "A4" });
    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));

    return new Promise((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      doc.fontSize(20).text(event.title, { align: "center" });
      doc.moveDown();
      doc.fontSize(14).text(`Booking ID: ${booking.bookingRef}`);
      doc.text(`Attendee: ${booking.attendeeName}`);
      doc.text(`Tickets: ${booking.tickets}`);
      doc.text(`Amount: LKR ${booking.amount}`);
      doc.text(`Status: ${booking.paymentStatus}`);
      doc.moveDown();
      doc.text(`Event: ${event.title}`);
      doc.text(`Date: ${new Date(event.date).toLocaleString()}`);
      doc.text(`Venue: ${event.venue}`);
      doc.moveDown();

      const qrImageBuffer = Buffer.from(qrDataUrl.split(",")[1], "base64");
      doc.image(qrImageBuffer, { fit: [150, 150], align: "center" });

      doc.end();
    });
  } catch (err) {
    throw new Error(`Error generating PDF buffer: ${err.message}`);
  }
}
