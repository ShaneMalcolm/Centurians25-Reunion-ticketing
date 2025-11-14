import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "../api/axios";
import { setEvent } from "../redux/eventSlice";
import { Link } from "react-router-dom";

export default function Home() {
  const dispatch = useDispatch();
  const event = useSelector((state) => state.event.data);

  useEffect(() => {
    async function fetchEvent() {
      const res = await axios.get("/event");
      dispatch(setEvent(res.data));
    }
    fetchEvent();
  }, [dispatch]);

  if (!event) return <div>Loading event...</div>;

  return (
    <div>
      <h1>{event.title}</h1>
      <p>{event.description}</p>
      <p>Venue: {event.venue}</p>
      <p>Date: {new Date(event.date).toLocaleString()}</p>
      <p>Ticket Price: LKR {event.price}</p>
      <Link to="/booking">Book Your Ticket</Link>
    </div>
  );
}
