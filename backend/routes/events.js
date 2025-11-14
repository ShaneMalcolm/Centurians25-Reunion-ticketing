// backend/routes/events.js
import express from "express";
import Event from "../models/Event.js";
import auth from "../middleware/auth.js";
const router = express.Router();

// get event (single)
router.get("/", async (req, res) => {
  const event = await Event.findOne({});
  res.json(event);
});

// admin create/update event (protected)
// For simplicity, protect with a token and check isAdmin flag on user (you can extend)
router.post("/", auth, async (req, res) => {
  // You should verify req.user is admin (lookup in DB) - simplified here
  const data = req.body;
  let event = await Event.findOne({});
  if (!event) event = new Event(data);
  else Object.assign(event, data);
  await event.save();
  res.json(event);
});

export default router;
