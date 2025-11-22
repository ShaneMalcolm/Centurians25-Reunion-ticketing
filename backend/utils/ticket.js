import QRCode from "qrcode";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import Event from "../models/Event.js";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

// -----------------------------------------------------
// EMAIL TRANSPORTER SETUP
// -----------------------------------------------------
let transporter;

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

    console.log("Using Ethereal test account:", testAccount.user);
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

  console.log("Using Production SMTP:", process.env.EMAIL_USER);
}

// -----------------------------------------------------
// Helper: Format date & time (Sri Lanka)
// -----------------------------------------------------
function formatEventDate(dateString) {
  const date = new Date(dateString);

  const formattedDate = date
    .toLocaleDateString("en-GB") // dd/mm/yyyy
    .replace(/\//g, "/");

  const formattedTime = "6.00 PM onwards";

  return { formattedDate, formattedTime };
}

// -----------------------------------------------------
// 1) GENERATE PDF & SEND EMAIL
// -----------------------------------------------------
export async function generateTicketPDFAndSend(booking) {
  try {
    const event = await Event.findOne({});
    if (!event) throw new Error("Event not found");

    const user = await User.findById(booking.user);
    if (!user || !user.email) throw new Error("User email missing");

    const qrDataUrl = await QRCode.toDataURL(booking._id.toString());
    const { formattedDate, formattedTime } = formatEventDate(event.date);

    // Temporary PDF path
    const tempPDF = path.join(process.cwd(), `tmp_ticket_${booking._id}.pdf`);

    const doc = new PDFDocument({ size: "A4" });
    const stream = fs.createWriteStream(tempPDF);
    doc.pipe(stream);

    // -----------------------------------------------------
    // HEADER
    // -----------------------------------------------------
    doc.fontSize(26).text(event.title, { align: "center", underline: true });
    doc.moveDown(1.5);

    // -----------------------------------------------------
    // BOOKING DETAILS
    // -----------------------------------------------------
    doc.fontSize(14).text(`Booking Reference: ${booking.bookingRef}`);
    doc.text(`Primary Attendee: ${booking.attendeeName}`);

    if (booking.plus1Name) {
      doc.text(`Plus One: ${booking.plus1Name}`);
    }

    doc.text(`Contact Number: ${booking.contactNumber}`);
    doc.text(`Tickets Purchased: ${booking.tickets}`);
    doc.text(`Amount Paid: LKR ${booking.amount}`);
    doc.moveDown(1);

    // -----------------------------------------------------
    // EVENT DETAILS
    // -----------------------------------------------------
    doc.fontSize(16).text("Event Details", { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(14).text(`Date: ${formattedDate}`);
    doc.text(`Time: ${formattedTime}`);
    doc.text(`Venue: ${event.venue}`);
    doc.moveDown(2);

    // -----------------------------------------------------
    // QR CODE
    // -----------------------------------------------------
    const qrImageBuffer = Buffer.from(qrDataUrl.split(",")[1], "base64");
    doc.image(qrImageBuffer, {
      fit: [180, 180],
      align: "center",
      valign: "center",
    });

    doc.moveDown(1);
    doc.fontSize(12).text("Show this QR code at the entrance.", {
      align: "center",
    });

    // END PDF
    doc.end();

    await new Promise((resolve) => stream.on("finish", resolve));

    // -----------------------------------------------------
    // SEND EMAIL
    // -----------------------------------------------------
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Your Ticket – ${event.title}`,
      text: `Hi ${booking.attendeeName},\n\nAttached is your official ticket.\nShow the QR code at the entrance.\n\nThank you!`,
      attachments: [{ filename: "ticket.pdf", path: tempPDF }],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Ticket emailed to ${user.email}`);

    if (process.env.NODE_ENV === "development") {
      console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
    }

    fs.unlinkSync(tempPDF);
  } catch (err) {
    console.error("Ticket generation error:", err.message);
    throw err;
  }
}

// -----------------------------------------------------
// 2) GENERATE PDF BUFFER (FOR DIRECT DOWNLOAD)
// -----------------------------------------------------
export async function generateTicketPDFBuffer(booking, event, user) {
  try {
    const qrDataUrl = await QRCode.toDataURL(booking._id.toString());
    const { formattedDate, formattedTime } = formatEventDate(event.date);

    const doc = new PDFDocument({ size: "A4" });
    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));

    return new Promise((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      doc.fontSize(26).text(event.title, { align: "center", underline: true });
      doc.moveDown(1.5);

      doc.fontSize(14).text(`Booking Reference: ${booking.bookingRef}`);
      doc.text(`Primary Attendee: ${booking.attendeeName}`);

      if (booking.plus1Name) {
        doc.text(`Plus One: ${booking.plus1Name}`);
      }

      doc.text(`Contact Number: ${booking.contactNumber}`);
      doc.text(`Tickets: ${booking.tickets}`);
      doc.text(`Amount: LKR ${booking.amount}`);
      doc.moveDown(1);

      doc.fontSize(16).text("Event Details", { underline: true });
      doc.fontSize(14);
      doc.text(`Date: ${formattedDate}`);
      doc.text(`Time: ${formattedTime}`);
      doc.text(`Venue: ${event.venue}`);
      doc.moveDown(1.5);

      const qrImageBuffer = Buffer.from(qrDataUrl.split(",")[1], "base64");
      doc.image(qrImageBuffer, {
        fit: [180, 180],
        align: "center",
      });

      doc.end();
    });
  } catch (err) {
    throw new Error("PDF buffer error: " + err.message);
  }
}
