// backend/utils/ticket.js
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
// EMAIL TRANSPORTER
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
// DATE FORMAT HELPERS
// -----------------------------------------------------
function formatEventDate(dateString) {
  const date = new Date(dateString);
  return {
    formattedDate: date.toLocaleDateString("en-GB"), // dd/mm/yyyy
    formattedTime: "6.00 PM onwards",
  };
}

// -----------------------------------------------------
// TEMPLATE PATH
// -----------------------------------------------------
const TEMPLATE_PATH = path.join(process.cwd(), "assets", "ticket_template.png");

// -----------------------------------------------------
// INTERNAL PDF BUILDER (used for email + download)
// -----------------------------------------------------
async function buildTicketPDF(doc, booking, event, user) {
  const qrDataUrl = await QRCode.toDataURL(booking.qrCodeData);
  const qrImageBuffer = Buffer.from(qrDataUrl.split(",")[1], "base64");
  const { formattedDate, formattedTime } = formatEventDate(event.date);

  // --- BACKGROUND TEMPLATE ---
  if (fs.existsSync(TEMPLATE_PATH)) {
    doc.image(TEMPLATE_PATH, 0, 0, { width: doc.page.width, height: doc.page.height });
  }

  // DARK FONT globally
  doc.fillColor("#000000");

  // ----------------------------
  // TITLE
  // ----------------------------
  doc.fontSize(28).font("Helvetica-Bold");
  doc.text(event.title, 40, 40, { align: "left" });

  // ----------------------------
  // COLUMN SETTINGS
  // ----------------------------
  const leftX = 40;
  const rightX = doc.page.width / 2 + 10;
  let leftY = 125;
  let rightY = 125;
  const lineSpacing = 8;
  const columnWidth = doc.page.width / 2 - 60;

  // Helper to draw left column
  function drawLeftDetail(label, value) {
    const labelFontSize = 10;
    const valueFontSize = 15;

    doc.font("Helvetica-Bold").fontSize(labelFontSize).fillColor("#555555");
    doc.text(label, leftX, leftY, { width: columnWidth });

    leftY += labelFontSize + 2;

    doc.font("Helvetica-Bold").fontSize(valueFontSize).fillColor("#000000");
    const wrappedHeight = doc.heightOfString(value, { width: columnWidth });
    doc.text(value, leftX, leftY, { width: columnWidth });
    leftY += wrappedHeight + lineSpacing;
  }

  drawLeftDetail("PRIMARY ATTENDEE", booking.attendeeName);
  if (booking.plus1Name) drawLeftDetail("PLUS ONE", booking.plus1Name);
  drawLeftDetail("CONTACT", booking.contactNumber);
  drawLeftDetail("TICKETS", booking.tickets.toString());
  drawLeftDetail("AMOUNT PAID", `LKR ${booking.amount}`);

  // Helper to draw right column
  function drawRightDetail(label, value) {
    const labelFontSize = 10;
    const valueFontSize = 15;

    doc.font("Helvetica-Bold").fontSize(labelFontSize).fillColor("#555555");
    doc.text(label, rightX, rightY, { width: columnWidth });

    rightY += labelFontSize + 2;

    doc.font("Helvetica-Bold").fontSize(valueFontSize).fillColor("#000000");
    const wrappedHeight = doc.heightOfString(value, { width: columnWidth });
    doc.text(value, rightX, rightY, { width: columnWidth });
    rightY += wrappedHeight + lineSpacing;
  }

  drawRightDetail("DATE", formattedDate);
  drawRightDetail("TIME", formattedTime);
  drawRightDetail("VENUE", event.venue);

  // ----------------------------
  // QR CODE (bottom right)
  // ----------------------------
  const qrSize = 180;
  const qrX = doc.page.width - qrSize - 40;
  const qrY = doc.page.height - qrSize - 100; // leave space for text below

  doc.image(qrImageBuffer, qrX, qrY, { fit: [qrSize, qrSize] });

  // Text below QR
  doc.fontSize(12).fillColor("#000000").text(
    "Present this QR at the entrance",
    qrX,
    qrY + qrSize + 6,
    { width: qrSize, align: "center" }
  );
}

// -----------------------------------------------------
// EMAIL TICKET
// -----------------------------------------------------
export async function generateTicketPDFAndSend(booking) {
  try {
    const event = await Event.findOne({});
    if (!event) throw new Error("Event not found");

    const user = await User.findById(booking.user);
    if (!user || !user.email) throw new Error("User email missing");

    const tempPDF = path.join(process.cwd(), `tmp_ticket_${booking._id}.pdf`);
    const doc = new PDFDocument({ size: "A4" });
    const stream = fs.createWriteStream(tempPDF);
    doc.pipe(stream);

    await buildTicketPDF(doc, booking, event, user);

    doc.end();
    await new Promise((resolve) => stream.on("finish", resolve));

    // send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Your Ticket – ${event.title}`,
      text: `Hi ${booking.attendeeName},\n\nYour ticket is attached.\nShow the QR at the entrance.\n\nThank you.`,
      attachments: [{ filename: "ticket.pdf", path: tempPDF }],
    });

    fs.unlinkSync(tempPDF);
  } catch (err) {
    console.error("Ticket email error:", err.message);
    throw err;
  }
}

// -----------------------------------------------------
// DOWNLOAD TICKET
// -----------------------------------------------------
export async function generateTicketPDFBuffer(booking, event, user) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4" });
      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      await buildTicketPDF(doc, booking, event, user);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
