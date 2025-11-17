import { useState, useEffect } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Booking() {
  const [attendeeName, setAttendeeName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [plus1, setPlus1] = useState(false);
  const [event, setEvent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await axios.get("/event");
        setEvent(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load event");
      }
    }
    fetchEvent();
  }, []);

  const handleBooking = async () => {
    if (!attendeeName.trim()) return toast.error("Please enter your name.");
    if (!contactNumber.trim())
      return toast.error("Please enter a contact number or email.");

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "/bookings",
        {
          attendeeName,
          contactNumber,
          tickets: plus1 ? 2 : 1,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Booking successful! Redirecting to payment...");
      setTimeout(() => {
        navigate(`/payment/${res.data._id}`);
      }, 1500);
    } catch (err) {
      console.error(err);
      toast.error(
        "Booking failed: " + (err.response?.data?.msg || err.message)
      );
    }
  };

  if (!event)
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-500">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 pt-24 flex justify-center px-4">
      <div className="w-full max-w-lg bg-white shadow-lg rounded-xl p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Booking for {event.title}
        </h2>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Your Name</label>
          <input
            type="text"
            value={attendeeName}
            onChange={(e) => setAttendeeName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your full name"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">
            Contact Number or Email
          </label>
          <input
            type="text"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
            placeholder="07X-XXXXXXX or example@gmail.com"
          />
        </div>

        <div className="flex items-center gap-2 mb-6">
          <input
            type="checkbox"
            checked={plus1}
            onChange={(e) => setPlus1(e.target.checked)}
            className="h-5 w-5"
          />
          <label className="text-gray-700 font-medium">Add a Plus One</label>
        </div>

        <button
          onClick={handleBooking}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg text-lg transition"
        >
          Pay LKR {event.price * (plus1 ? 2 : 1)}
        </button>
      </div>
    </div>
  );
}
