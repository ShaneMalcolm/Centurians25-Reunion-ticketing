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
// TEMPLATE PATH
// -----------------------------------------------------
const TEMPLATE_PATH = path.join(process.cwd(), "assets", "ticket_template.png");

// -----------------------------------------------------
// INTERNAL PDF BUILDER (modified)
// -----------------------------------------------------
async function buildTicketPDF(doc, booking, event, user) {
  const qrDataUrl = await QRCode.toDataURL(booking.qrCodeData);
  const qrImageBuffer = Buffer.from(qrDataUrl.split(",")[1], "base64");

  // Add background template
  if (fs.existsSync(TEMPLATE_PATH)) {
    doc.image(TEMPLATE_PATH, 0, 0, {
      width: doc.page.width,
      height: doc.page.height,
    });
  }

  doc.fillColor("#000000");

  // ---------------------------------------------------------
  // LEFT COLUMN – moved LOWER + larger fonts
  // ---------------------------------------------------------
  const leftX = 80;
  let leftY = doc.page.height / 2 - 120; // moved down to center vertically

  const labelFontSize = 12;
  const valueFontSize = 20;
  const lineSpacing = 10;
  const columnWidth = doc.page.width / 2 - 60;

  function drawLeftDetail(label, value) {
    doc.font("Helvetica-Bold").fontSize(labelFontSize).fillColor("#444");
    doc.text(label, leftX, leftY, { width: columnWidth });

    leftY += labelFontSize + 4;

    doc.font("Helvetica-Bold").fontSize(valueFontSize).fillColor("#000");
    const wrappedHeight = doc.heightOfString(value, { width: columnWidth });
    doc.text(value, leftX, leftY, { width: columnWidth });

    leftY += wrappedHeight + lineSpacing;
  }

  drawLeftDetail("PRIMARY ATTENDEE", booking.attendeeName);

  if (booking.plus1Name) {
    drawLeftDetail("PLUS ONE", booking.plus1Name);
  }

  drawLeftDetail("TICKETS", booking.tickets.toString());
  drawLeftDetail("AMOUNT PAID", `LKR ${booking.amount}`);

  // ---------------------------------------------------------
  // QR CODE – moved UP to be vertically centered
  // ---------------------------------------------------------
  const qrSize = 200;
  const qrX = doc.page.width - qrSize - 40;
  const qrY = doc.page.height / 2 - qrSize / 2 - 20; // centered vertically

  doc.image(qrImageBuffer, qrX, qrY, { fit: [qrSize, qrSize] });

  // Add dark semi-transparent box
doc.save();
doc.fillColor("#FFFFFF");
doc.opacity(0.30);   // 55% black overlay
doc.rect(qrX, qrY + qrSize + 5, qrSize, 40).fill();
doc.restore();

  // Text below QR
  doc
  .font("Helvetica-Bold")
  .fontSize(14)
  .fillColor("#000000")
  .strokeColor("#FFFFFF")
  .lineWidth(1)
  .text("Present this QR at the entrance", qrX, qrY + qrSize + 10, {
    width: qrSize,
    align: "center",
  });

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
