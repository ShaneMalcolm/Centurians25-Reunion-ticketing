import React, { useState } from "react";
import axios from "../api/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function AddPlusOneModal({ booking, onClose, refresh }) {
  const [plusName, setPlusName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!plusName.trim()) return toast.error("Enter plus one name");

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/bookings/${booking._id}/add-plusone`,
        { plus1Name: plusName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Plus one added. Redirecting to payment...");
      refresh();
      onClose();
      navigate(`/payment/${booking._id}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add plus one");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center p-4 z-50">
      <div className="bg-white p-6 w-full max-w-md rounded-xl shadow-xl">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Add Plus One</h3>

        <p className="text-gray-600 mb-2">Booking ID: {booking._id}</p>

        <input
          type="text"
          placeholder="Plus one name"
          value={plusName}
          onChange={(e) => setPlusName(e.target.value)}
          className="w-full border p-3 rounded-lg mb-4"
        />

        <div className="flex gap-3">
          <button
            className="w-full py-2 bg-gray-300 hover:bg-gray-400 rounded-lg"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            onClick={handleSubmit}
          >
            Continue to Pay
          </button>
        </div>
      </div>
    </div>
  );
}
