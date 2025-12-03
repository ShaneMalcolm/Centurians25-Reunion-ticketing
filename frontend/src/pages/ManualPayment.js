// frontend/src/pages/ManualPayment.js
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../api/axios";
import toast from "react-hot-toast";

export default function ManualPayment() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  // Example bank details - replace with your actual details
  const bankDetails = {
    bankName: "Commercial Bank",
    accountName: "K S R N Benildus",
    accountNumber: "8002298746",
    branch: "Kandana",
    referenceNote: `Use booking ref as reference`,
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
        console.error(err);
        toast.error("Failed to load booking");
      }
    }
    fetchBooking();
  }, [bookingId]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return toast.error("Please choose a receipt file (image or PDF).");
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
      toast.success("Receipt uploaded — awaiting verification.");
    } catch (err) {
      console.error(err);
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
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-2">Manual Payment / Upload Receipt</h2>
        <p className="text-gray-600 mb-4">Booking: <strong>{booking.bookingRef}</strong></p>

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

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload Receipt (image or PDF)</label>
          <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} />
          {booking.receiptUrl && (
            <div className="mt-3">
              <p className="text-sm">Previously uploaded receipt: <a target="_blank" rel="noreferrer" href={booking.receiptUrl} className="text-blue-600 underline">View</a></p>
              <p className="text-sm">Status: <span className="font-medium">{booking.receiptStatus}</span></p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            {uploading ? "Uploading..." : "Upload Receipt"}
          </button>

          <Link to={`/booking/${booking._id}`} className="py-2 px-4 bg-gray-200 rounded-md">
            Back to booking
          </Link>
        </div>
      </div>
    </div>
  );
}
