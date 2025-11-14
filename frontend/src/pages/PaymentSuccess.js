import { useParams } from "react-router-dom";

export default function PaymentSuccess() {
  const { bookingId } = useParams();
  return <div>Payment successful! Booking ID: {bookingId}</div>;
}
