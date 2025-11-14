import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axios";

export default function FakePayment() {
  const { bookingId } = useParams();
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch booking status from backend on component mount
  const fetchBookingStatus = async () => {
    try {
      const token = localStorage.getItem("token"); // JWT token if used
      const res = await axios.get(`/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsPaid(res.data.paymentStatus === "paid");
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch booking:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingStatus();
  }, [bookingId]);

  const handlePay = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `/bookings/${bookingId}/mark-paid`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Payment simulated! Booking is now paid.");
      setIsPaid(true);
    } catch (err) {
      console.error(err);
      alert("Failed to mark booking as paid.");
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
    } catch (err) {
      console.error("Error downloading ticket:", err);
      alert("Failed to download ticket.");
    }
  };

  if (loading) return <div>Loading booking info...</div>;

  return (
    <div>
      <h2>Booking {bookingId}</h2>

      {!isPaid && <button onClick={handlePay}>Pay Now (Simulated)</button>}

      {isPaid && (
        <>
          <p>Payment completed!</p>
          <button onClick={handleDownload}>Download Ticket</button>
        </>
      )}
    </div>
  );
}
