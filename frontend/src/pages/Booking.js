//frontend/src/pages/Booking.js
import { useState, useEffect } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Booking() {
  const [attendeeName, setAttendeeName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [userClass, setUserClass] = useState(""); // NEW
  const [plus1, setPlus1] = useState(false);
  const [plus1Name, setPlus1Name] = useState("");
  const [event, setEvent] = useState(null);
  const navigate = useNavigate();

  /* ------------------------------------------------------
     Fetch Event + Prefill User Data (Name + Contact + Class)
     ------------------------------------------------------ */
  useEffect(() => {
    async function loadData() {
      try {
        const eventRes = await axios.get("/event");
        setEvent(eventRes.data);

        const token = localStorage.getItem("token");
        if (token) {
          const userRes = await axios.get("/me", {
            headers: { Authorization: `Bearer ${token}` },
          });

          const user = userRes.data;

          const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
          if (fullName) setAttendeeName(fullName);
          if (user.contactNumber) setContactNumber(user.contactNumber);
          if (user.class) setUserClass(user.class); // NEW
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load booking data");
      }
    }

    loadData();
  }, []);

  /* ------------------------------------------------------
     Submit Booking
     ------------------------------------------------------ */
  const handleBooking = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "/bookings",
        {
          attendeeName,
          contactNumber,
          class: userClass,  // NEW (sent to backend)
          tickets: plus1 ? 2 : 1,
          plus1Name: plus1 ? plus1Name : undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Booking successful! Redirecting...");
      setTimeout(() => navigate(`/manual-payment/${res.data._id}`), 1500);
    } catch (err) {
      console.error(err);
      toast.error("Booking failed");
    }
  };

  /* ------------------------------------------------------
     UI
     ------------------------------------------------------ */
  if (!event)
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-500">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 pt-24 flex justify-center px-4">
      <div className="w-full max-w-xl bg-white shadow-xl rounded-2xl p-8 border border-gray-100 mb-10">

        <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center tracking-tight">
          {event.title}
        </h2>
        <p className="text-center text-gray-500 mb-8">
          Secure your entry by completing the form below
        </p>

        <div className="space-y-6">
          {/* User details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3 border-l-4 border-blue-600 pl-3">
              Your Details
            </h3>

            {/* Name */}
            <label className="block text-gray-600 font-medium mb-1">Name</label>
            <input
              type="text"
              value={attendeeName}
              readOnly
              className="w-full border border-gray-300 rounded-lg p-3 bg-gray-100"
            />

            {/* Contact */}
            <label className="block text-gray-600 font-medium mt-4 mb-1">
              Contact Number
            </label>
            <input
              type="text"
              value={contactNumber}
              readOnly
              className="w-full border border-gray-300 rounded-lg p-3 bg-gray-100"
            />

            {/* CLASS - NEW FIELD */}
            <label className="block text-gray-600 font-medium mt-4 mb-1">
              Class
            </label>
            <input
              type="text"
              value={userClass}
              readOnly
              className="w-full border border-gray-300 rounded-lg p-3 bg-gray-100"
            />
          </div>

          {/* Plus One */}
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
              <label className="text-gray-700 font-medium">Add a Plus One</label>
            </div>

            {plus1 && (
              <div className="mt-4">
                <label className="block text-gray-600 font-medium mb-1">
                  Plus One Name
                </label>
                <input
                  type="text"
                  value={plus1Name}
                  onChange={(e) => setPlus1Name(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3"
                  placeholder="Enter plus one’s name"
                />
              </div>
            )}
          </div>

          {/* Pricing */}
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

          {/* Submit */}
          <button
            onClick={handleBooking}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg text-lg shadow-md"
          >
            Continue to Payment
          </button>
        </div>
      </div>
    </div>
  );
}
