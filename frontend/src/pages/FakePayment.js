import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axios";
import toast from "react-hot-toast";

export default function FakePayment() {
  const { bookingId } = useParams();
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchBookingStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsPaid(res.data.paymentStatus === "paid");
    } catch (err) {
      console.error("Failed to fetch booking:", err);
      toast.error("Failed to fetch booking info");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingStatus();
  }, [bookingId]);

  const handlePay = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/bookings/${bookingId}/mark-paid`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Payment simulated! Booking is now paid.");
      setIsPaid(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to mark booking as paid");
    }
  };

  const handleDownload = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/bookings/${bookingId}/ticket`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `ticket_${bookingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Ticket downloaded successfully!");
    } catch (err) {
      console.error("Error downloading ticket:", err);
      toast.error("Failed to download ticket");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Loading booking info...
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 pt-20">
      <div className="max-w-md w-full bg-white shadow-md rounded-xl p-6 space-y-4 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Your Booking ID {bookingId}</h2>

        {!isPaid ? (
          <button
            onClick={handlePay}
            className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            Pay Now (Simulated)
          </button>
        ) : (
          <>
            <p className="text-green-600 font-medium">Payment completed!</p>
            <button
              onClick={handleDownload}
              className="py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
            >
              Download Ticket
            </button>
          </>
        )}
      </div>
    </div>
  );
}
