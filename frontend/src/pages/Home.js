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
      {/* Push content down to accommodate fixed navbar */}
      <div className="pt-20 flex justify-center px-4">
        <div className="max-w-4xl w-full bg-white rounded-xl overflow-hidden shadow-lg">
          {/* Event Banner */}
          <img
            src={event.image || "/sample-event.jpg"}
            alt={event.title}
            className="w-full h-48 sm:h-64 md:h-72 lg:h-80 object-cover transition-all duration-300"
          />

          {/* Event Details */}
          <div className="p-6 sm:p-8 space-y-3 sm:space-y-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">
              {event.title}
            </h1>
            <p className="text-sm sm:text-base text-gray-600">{event.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-4 text-gray-700 font-medium text-sm sm:text-base">
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
              className="inline-block w-full text-center py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition text-sm sm:text-base"
            >
              Book Your Ticket
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
