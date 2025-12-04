import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../api/axios";
import toast from "react-hot-toast";

export default function ManualPayment() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const bankDetails = {
    bankName: "Commercial Bank",
    accountName: "K S R N Benildus",
    accountNumber: "8002298746",
    branch: "Kandana",
  };

  useEffect(() => {
    async function fetchBooking() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`/bookings/${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBooking(res.data);
      } catch (err) {
        toast.error("Failed to load booking");
      }
    }
    fetchBooking();
  }, [bookingId]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return toast.error("Please choose a receipt image.");
    if (!file.type.startsWith("image/"))
      return toast.error("Only image files are allowed.");

    setUploading(true);
    try {
      const token = localStorage.getItem("token");
      const form = new FormData();
      form.append("receipt", file);

      const res = await axios.post(`/bookings/${bookingId}/upload-receipt`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setBooking(res.data.booking);

      // Show modal after successful upload
      setShowModal(true);

    } catch (err) {
      toast.error(err.response?.data?.msg || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (!booking)
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 pt-20">
        <div className="text-gray-500">Loading booking...</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 pt-24 p-4 flex justify-center">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-6 relative">
        
        <h2 className="text-xl font-semibold mb-2">Manual Payment / Upload Receipt</h2>
        <p className="text-gray-600 mb-4">
          Booking: <strong>{booking.bookingRef}</strong>
        </p>

        {/* Bank Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
          <h3 className="font-medium mb-2">Bank Details</h3>
          <div className="text-sm text-gray-700 space-y-1">
            <div><span className="font-medium">Bank:</span> {bankDetails.bankName}</div>
            <div><span className="font-medium">Account:</span> {bankDetails.accountNumber}</div>
            <div><span className="font-medium">Name:</span> {bankDetails.accountName}</div>
            <div><span className="font-medium">Branch:</span> {bankDetails.branch}</div>
            <div><span className="font-medium">Reference:</span> Use <strong>{booking.bookingRef}</strong> as reference</div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Receipt (images only)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          {booking.receiptUrl && (
            <div className="mt-3">
              <p className="text-sm">
                Previously uploaded:{" "}
                <a
                  target="_blank"
                  rel="noreferrer"
                  href={booking.receiptUrl}
                  className="text-blue-600 underline"
                >
                  View
                </a>
              </p>
              <p className="text-sm">
                Status: <span className="font-medium">{booking.receiptStatus}</span>
              </p>
            </div>
          )}
        </div>

        {/* Upload Button */}
        <div className="flex gap-3">
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            {uploading ? "Uploading..." : "Upload Receipt"}
          </button>
        </div>

        {/* View Booking Button */}
        <div className="mt-6">
          <button
            onClick={() => navigate("/profile")}
            className="py-2 px-4 bg-gray-800 text-white rounded-md hover:bg-black"
          >
            View Your Booking
          </button>
        </div>

        {/* MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-3">Receipt Received</h3>
              <p className="text-gray-700 mb-6 leading-relaxed">
              Thank you for uploading your payment receipt. Our team will review and verify your
              payment shortly. Once your booking is confirmed, your ticket will be emailed to you.
              You can also download your ticket anytime through your profile page on this website..
              <br /><br />
              Verification may take up to 24 hours — we appreciate your patience.
            </p>
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Okay
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
