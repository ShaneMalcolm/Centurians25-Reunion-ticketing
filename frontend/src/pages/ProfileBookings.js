// frontend/src/pages/ProfileBookings.js
import { useEffect, useState } from "react";
import axios from "../api/axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function ProfileBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/bookings/user", { headers: { Authorization: `Bearer ${token}` } });
        setBookings(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load your bookings");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen pt-24 p-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">My Bookings</h2>

        {bookings.length === 0 && <div className="text-gray-500">You have no bookings yet.</div>}

        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b._id} className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">{b.bookingRef}</div>
                <div className="font-medium">{b.attendeeName}{b.plus1Name ? ` + ${b.plus1Name}` : ""}</div>
                <div className="text-sm text-gray-500">Tickets: {b.tickets} • {b.paymentStatus}</div>
              </div>

              <div className="flex gap-2">
                <Link to={`/booking/${b._id}`} className="py-2 px-3 bg-gray-100 rounded">Details</Link>
                {b.paymentStatus !== "paid" && <Link to={`/manual-payment/${b._id}`} className="py-2 px-3 bg-blue-600 text-white rounded">Upload Receipt</Link>}
                {b.paymentStatus === "paid" && <Link to={`/download/${b._id}`} className="py-2 px-3 bg-green-600 text-white rounded">Download</Link>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
