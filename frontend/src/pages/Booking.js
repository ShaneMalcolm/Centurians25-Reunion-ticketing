import { useState, useEffect } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

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
        alert("Failed to load event");
      }
    }
    fetchEvent();
  }, []);

  const handleBooking = async () => {
    if (!attendeeName) return alert("Enter your name");

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

      // redirect to payment page with booking ID
      navigate(`/payment/${res.data._id}`);
    } catch (err) {
      console.error(err);
      alert("Booking failed: " + (err.response?.data?.msg || err.message));
    }
  };

  if (!event) return <div>Loading...</div>;

  return (
    <div>
      <h2>Booking for {event.title}</h2>
      <input
        type="text"
        placeholder="Your Name"
        value={attendeeName}
        onChange={(e) => setAttendeeName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Contact Number or Email"
        value={contactNumber}
        onChange={(e) => setContactNumber(e.target.value)}
      />
      <label>
        <input
          type="checkbox"
          checked={plus1}
          onChange={(e) => setPlus1(e.target.checked)}
        />
        Plus 1 Ticket
      </label>
      <button onClick={handleBooking}>
        Pay LKR {event.price * (plus1 ? 2 : 1)}
      </button>
    </div>
  );
}
