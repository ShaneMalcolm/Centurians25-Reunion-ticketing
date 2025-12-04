import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { handleLogout } from "../utils/auth";
import { HiMenu, HiX } from "react-icons/hi";

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = user?.isAdmin;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-transparent backdrop-blur-md font-sohneBreit">
      <div className="container mx-auto flex justify-between items-center py-3 px-6">
        {/* Brand / Logo */}
        {isAdmin ? (
          <div className="flex items-center gap-2 cursor-default">
            <img
              src="/Centurians25-logo.png"
              alt="Centurians25 Logo"
              className="w-14 h-14 object-contain"
            />
            <span className="text-l md:text-xl font-sohneBreit text-black">
              Centurians’25 Ticketing
            </span>
          </div>
        ) : (
          <Link
            to="/"
            className="flex items-center gap-2 cursor-pointer"
          >
            <img
              src="/Centurians25-logo.png"
              alt="Centurians25 Logo"
              className="w-14 h-14 object-contain"
            />
            <span className={`text-l md:text-xl font-sohneBreit text-black hover:text-gray-700 transition sm:inline ${mobileMenuOpen ? "inline" : "hidden"}`}>
              Centurians’25 Ticketing
            </span>
          </Link>
        )}

        {/* Desktop Menu */}
        <div className="hidden sm:flex items-center gap-4 z-50">
          {!user ? (
            <>
              <Link
                to="/login"
                className="text-black hover:text-gray-700 font-medium transition cursor-pointer active:scale-95 pointer-events-auto"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-black hover:text-gray-700 font-medium transition cursor-pointer active:scale-95 pointer-events-auto"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <Link to={isAdmin ? "/admin" : "/profile"}>
                <span className="text-black font-medium select-none cursor-pointer">
                  Hi, {user.firstName}
                </span>
              </Link>
              <button
                onClick={() => handleLogout(navigate)}
                className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded font-medium transition cursor-pointer active:scale-95 pointer-events-auto"
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="sm:hidden z-50">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-black focus:outline-none"
          >
            {mobileMenuOpen ? <HiX size={28} /> : <HiMenu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white/80 backdrop-blur-md w-full absolute top-full left-0 px-6 py-4 shadow-md flex flex-col gap-3">
          {!user ? (
            <>
              <Link
                to="/login"
                className="text-black hover:text-gray-700 font-medium transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-black hover:text-gray-700 font-medium transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <Link to={isAdmin ? "/admin" : "/profile"}>
                <span
                  className="text-black font-medium select-none cursor-pointer"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Hi, {user.firstName}
                </span>
              </Link>
              <button
                onClick={() => {
                  handleLogout(navigate);
                  setMobileMenuOpen(false);
                }}
                className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded font-medium transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}

      {/* Optional: add touch highlight for iOS */}
      <style>
        {`
          a, button {
            -webkit-tap-highlight-color: rgba(0,0,0,0.2);
          }
        `}
      </style>
    </nav>
  );
}
