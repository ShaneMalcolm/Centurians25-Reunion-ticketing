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
      try {
        const res = await axios.get("/event");
        dispatch(setEvent(res.data));
      } catch (err) {
        console.error("Error fetching event:", err);
      }
    }
    fetchEvent();
  }, [dispatch]);

  if (!event)
    return (
      <div className="text-center mt-20 text-gray-500">
        Loading event...
      </div>
    );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Full-screen hero */}
      <section className="flex flex-col justify-center items-center h-screen px-4 text-center bg-gray-50">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-sohneBreit font-bold mb-4 text-yellow-300 [text-shadow:2px_1.5px_1px_rgba(255,50,0,0.6)]">
          Welcome to CENTURIANS'25
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-gray-700 font-medium drop-shadow">
          Official Ticketing Portal
        </p>
        <p className="mt-2 text-base sm:text-lg md:text-xl text-gray-600">
          Book your ticket now and join the reunion!
        </p>
      </section>

      {/* Event card */}
      <section className="flex justify-center px-3 -mt-2 z-10 relative">
        <div className="max-w-4xl w-full bg-white rounded-xl overflow-hidden shadow-lg">
          <img
            src={event.image || "/sample-event-chatgpt.jpg"}
            alt={event.title}
            className="w-full h-48 sm:h-64 md:h-72 lg:h-80 object-cover transition-all duration-300"
          />

          <div className="p-6 sm:p-8 space-y-3 sm:space-y-4 text-gray-800">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              {event.title}
            </h2>
            <p className="text-sm sm:text-base text-gray-600">{event.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-4 font-medium text-sm sm:text-base text-gray-700">
              <div>
                <span className="text-gray-500">Venue:</span> {event.venue}
              </div>
              <div>
                <span className="text-gray-500">Date:</span>{" "}
                {new Date(event.date).toLocaleString()}
              </div>
              <div>
                <span className="text-gray-500">Ticket Price:</span> LKR {event.price}
              </div>
            </div>

            <Link
              to="/booking"
              className="inline-block w-full text-center py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition text-sm sm:text-base mt-2"
            >
              Book Your Ticket
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
