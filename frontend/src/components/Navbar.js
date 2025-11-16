import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { handleLogout } from "../utils/auth";

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#222]/70 backdrop-blur-md">
      <div className="container mx-auto flex justify-between items-center py-3 px-6">
        {/* Brand */}
        <Link to="/" className="text-xl font-semibold text-black hover:text-gray-700 transition">
          Reunion Ticketing
        </Link>

        {/* Navigation Links / User Info */}
        <div className="flex items-center gap-4">
          {!user ? (
            <>
              <Link
                to="/login"
                className="text-black hover:text-gray-700 font-medium transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-black hover:text-gray-700 font-medium transition"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <span className="text-black font-medium">Hi, {user.firstName}</span>
              <button
                onClick={() => handleLogout(navigate)}
                className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded font-medium transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
