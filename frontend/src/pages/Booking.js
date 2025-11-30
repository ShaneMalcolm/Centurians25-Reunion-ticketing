//frontend\src\pages\Booking.js
import { useState, useEffect } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Booking() {
  const [attendeeName, setAttendeeName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [plus1, setPlus1] = useState(false);
  const [plus1Name, setPlus1Name] = useState("");
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
      return toast.error("Please enter your contact number.");
    if (plus1 && !plus1Name.trim())
      return toast.error("Please enter your plus one’s name.");

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "/bookings",
        {
          attendeeName,
          contactNumber,
          tickets: plus1 ? 2 : 1,
          plus1Name: plus1 ? plus1Name : undefined,
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
  <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 pt-24 flex justify-center px-4">
    <div className="w-full max-w-xl bg-white shadow-xl rounded-2xl p-8 border border-gray-100 mb-10">
      
      {/* Header */}
      <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center tracking-tight">
        {event.title}
      </h2>
      <p className="text-center text-gray-500 mb-8">
        Secure your entry by completing the form below
      </p>

      {/* Main Form */}
      <div className="space-y-6">
        
        {/* Section: Primary Attendee */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3 border-l-4 border-blue-600 pl-3">
            Your Details
          </h3>

          <label className="block text-gray-600 font-medium mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={attendeeName}
            onChange={(e) => setAttendeeName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
            placeholder="Your name"
          />

          <label className="block text-gray-600 font-medium mt-4 mb-1">
            Contact Number
          </label>
          <input
            type="text"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
            placeholder="07X-XXXXXXX"
          />
        </div>

        {/* Section: Plus One */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3 border-l-4 border-green-600 pl-3">
            Plus One
          </h3>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={plus1}
              onChange={(e) => setPlus1(e.target.checked)}
              className="h-5 w-5"
            />
            <label className="text-gray-700 font-medium">
              Add a Plus One
            </label>
          </div>

          {plus1 && (
            <div className="mt-4 transition-all duration-300">
              <label className="block text-gray-600 font-medium mb-1">
                Plus One Name
              </label>
              <input
                type="text"
                value={plus1Name}
                onChange={(e) => setPlus1Name(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500"
                placeholder="Enter plus one’s name"
              />
            </div>
          )}
        </div>

        {/* Price Section */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mt-4 shadow-inner">
          <div className="flex justify-between text-gray-700 font-medium">
            <span>Tickets:</span>
            <span>{plus1 ? "2 Tickets" : "1 Ticket"}</span>
          </div>
          <div className="flex justify-between text-lg font-bold mt-2 text-gray-900">
            <span>Total Payable:</span>
            <span className="text-blue-600">
              LKR {event.price * (plus1 ? 2 : 1)}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleBooking}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg text-lg transition shadow-md"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  </div>
);
}
