import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axios";

export default function Success() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    async function fetchBooking() {
      const res = await axios.get(`/bookings/${bookingId}`);
      setBooking(res.data);
    }
    fetchBooking();
  }, [bookingId]);

  if (!booking) return <div>Loading...</div>;

  return (
    <div>
      <h2>Payment {booking.paymentStatus.toUpperCase()}</h2>
      <p>Booking ID: {booking.bookingRef}</p>
      <p>Attendee: {booking.attendeeName}</p>
      <p>Tickets: {booking.tickets}</p>
      <p>Check your email for your ticket (PDF + QR Code)</p>
    </div>
  );
}
