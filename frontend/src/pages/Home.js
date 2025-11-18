import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "../api/axios";
import { setEvent } from "../redux/eventSlice";
import { Link } from "react-router-dom";

export default function Home() {
  const dispatch = useDispatch();
  const event = useSelector((state) => state.event.data);
  const eventCardRef = useRef(null);
  const [showArrow, setShowArrow] = useState(true);
  const [eventCardVisible, setEventCardVisible] = useState(false);

  // Fetch event
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

  // Handle scroll for arrow fade and event card reveal
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) setShowArrow(false);
      else setShowArrow(true);

      if (eventCardRef.current) {
        const rect = eventCardRef.current.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) setEventCardVisible(true);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!event)
    return (
      <div className="text-center mt-20 text-gray-500">
        Loading event...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Hero Section */}
      <section className="relative flex flex-col justify-center items-center h-screen px-4 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-sohneBreit font-bold mb-4 text-[#E6B800] [text-shadow:2px_1.5px_1px_rgba(255,215,0,0.8)] animate-fadeIn">
          Welcome to CENTURIANS'25
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl font-medium text-gray-700 opacity-0 animate-fadeIn delay-200">
          Official Ticketing Portal
        </p>
        <p className="mt-2 text-base sm:text-lg md:text-xl text-gray-600 opacity-0 animate-fadeIn delay-400">
          Book your ticket now and join the reunion!
        </p>

        {/* Scroll Down Arrow */}
        {showArrow && (
          <div className="absolute bottom-10 animate-bounceArrow transition-opacity duration-500">
            <svg
              className="w-6 h-6 text-yellow-400"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}
      </section>

      {/* Event Card */}
      <section
        ref={eventCardRef}
        className="flex justify-center px-4 -mt-2 z-10 relative"
      >
        <div
          className={`max-w-4xl w-full bg-white rounded-xl overflow-hidden border border-yellow-200 shadow-2xl transition-all duration-700 ${eventCardVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
        >
          {/* Event Image */}
          <img
            src={event.image || "/sample-event-chatgpt.jpg"}
            alt={event.title}
            className="w-full object-cover max-h-[450px] sm:max-h-[500px] md:max-h-[550px] transition-all duration-300"
          />
          {/* Event Details */}
          <div className="p-6 sm:p-8 space-y-6 bg-white/80 backdrop-blur-md rounded-xl shadow-lg ">
            {/* Event Title */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-sohneBreit text-gray-800">
              {event.title}
            </h2>

            {/* Event Description */}
            <p className="text-sm sm:text-base text-gray-600">{event.description}</p>

            {/* Event Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-medium text-gray-700 text-sm sm:text-base">
              <div className="flex flex-col gap-1">
                <span className="text-gray-500 uppercase text-xs">Venue</span>
                <span className="text-gray-800 font-semibold">{event.venue}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-500 uppercase text-xs">Date</span>
                <span className="text-gray-800 font-semibold">
                  {new Date(event.date).toLocaleDateString("en-GB")}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-500 uppercase text-xs">Time</span>
                <span className="text-gray-800 font-semibold">
                  {new Date(event.date).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                    timeZone: "Asia/Colombo",
                  })}{" "}
                  onwards
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-500 uppercase text-xs">Ticket Price</span>
                <span className="text-[#E6B800] [text-shadow:1px_0.5px_0px_rgba(255,215,0,0.8)] text-lg sm:text-xl font-bold">
                  LKR {event.price}
                </span>
              </div>
            </div>


            <Link
              to="/booking"
              className="inline-block w-full text-center py-3 px-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all duration-200 mt-2"
            >
              Book Your Ticket
            </Link>
          </div>
        </div>
      </section>

      {/* Animations */}
      <style>
        {`
          @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn { animation: fadeIn 1s forwards; }
          .delay-200 { animation-delay: 0.2s; }
          .delay-400 { animation-delay: 0.4s; }

          @keyframes bounceArrow {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(10px); }
            60% { transform: translateY(5px); }
          }
          .animate-bounceArrow { animation: bounceArrow 2s infinite; }
        `}
      </style>
    </div>
  );
}
