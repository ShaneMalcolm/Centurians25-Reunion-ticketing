import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import toast from "react-hot-toast";
import AddPlusOneModal from "../components/AddPlusOneModal";

export default function UserProfile() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/bookings/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load your bookings.");
    } finally {
      setLoading(false);
    }
  };

  const downloadTicket = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/bookings/${id}/ticket`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `ticket_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Ticket downloaded!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download ticket");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Loading your bookings...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 pt-24 p-4">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Your Bookings
        </h2>

        {bookings.length === 0 && (
          <p className="text-center text-gray-600">You have no bookings.</p>
        )}

        <div className="space-y-5">
          {bookings.map((b) => (
            <div
              key={b._id}
              className="border rounded-xl p-5 shadow-sm bg-gray-50"
            >
              <div className="flex justify-between">
                <p className="font-semibold text-gray-700">Booking ID:</p>
                <p className="text-gray-800">{b.bookingRef}</p>
              </div>

              <div className="flex justify-between mt-2">
                <p className="font-semibold text-gray-700">Tickets:</p>
                <p>{b.tickets}</p>
              </div>

              {b.plus1Name && (
                <div className="flex justify-between mt-1">
                  <p className="font-semibold text-gray-700">Plus One:</p>
                  <p>{b.plus1Name}</p>
                </div>
              )}

              <div className="flex justify-between mt-2">
                <p className="font-semibold text-gray-700">Payment:</p>
                <p
                  className={
                    b.paymentStatus === "paid"
                      ? "text-green-600 font-semibold"
                      : "text-red-600 font-semibold"
                  }
                >
                  {b.paymentStatus}
                </p>
              </div>

              <div className="flex gap-3 mt-4">
                {b.paymentStatus === "paid" && (
                  <button
                    onClick={() => downloadTicket(b._id)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium w-full"
                  >
                    Download Ticket
                  </button>
                )}

                {b.tickets === 1 && b.paymentStatus === "paid" && (
                  <button
                    onClick={() => setSelectedBooking(b)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium w-full"
                  >
                    Add Plus One
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedBooking && (
        <AddPlusOneModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          refresh={fetchBookings}
        />
      )}
    </div>
  );
}
