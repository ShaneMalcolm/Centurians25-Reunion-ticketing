// frontend/src/pages/BookingDetails.js
import { useEffect, useState } from "react";
import axios from "../api/axios";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function BookingDetails() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`/bookings/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBooking(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load booking");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const downloadTicket = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/bookings/${id}/ticket`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `ticket_${booking.bookingRef}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Ticket downloaded");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.msg || "Failed to download ticket");
    }
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return toast.error("Pick a file first");
    setUploading(true);
    try {
      const token = localStorage.getItem("token");
      const form = new FormData();
      form.append("receipt", file);

      const res = await axios.post(`/bookings/${id}/upload-receipt`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setBooking(res.data.booking);
      toast.success("Receipt uploaded, awaiting verification");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.msg || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!booking) return <div className="min-h-screen flex items-center justify-center">No booking found</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 p-4 flex justify-center">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-2">Booking {booking.bookingRef}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-sm text-gray-500">Attendee</div>
            <div className="font-medium">{booking.attendeeName}</div>
            {booking.plus1Name && (
              <>
                <div className="text-sm text-gray-500 mt-2">Plus One</div>
                <div className="font-medium">{booking.plus1Name}</div>
              </>
            )}
          </div>
          <div>
            <div className="text-sm text-gray-500">Tickets</div>
            <div className="font-medium">{booking.tickets}</div>

            <div className="text-sm text-gray-500 mt-2">Amount</div>
            <div className="font-bold text-blue-600">LKR {booking.amount}</div>

            <div className="text-sm text-gray-500 mt-2">Payment</div>
            <div className="font-medium">{booking.paymentStatus}</div>

            <div className="text-sm text-gray-500 mt-2">Receipt Status</div>
            <div className="font-medium">{booking.receiptStatus}</div>
          </div>
        </div>

        {booking.paymentStatus === "paid" ? (
          <button onClick={downloadTicket} className="w-full bg-green-600 text-white py-2 rounded-md mb-3">Download Ticket</button>
        ) : (
          <>
            <div className="mb-3">
              <p className="text-sm text-gray-600">If you've paid via bank transfer, upload the receipt here to request verification.</p>
            </div>

            <div className="mb-4">
              <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} />
              <div className="mt-2 flex gap-3">
                <button onClick={handleUpload} disabled={uploading} className="py-2 px-4 bg-blue-600 text-white rounded-md">
                  {uploading ? "Uploading..." : "Upload Receipt"}
                </button>
                <Link to={`/manual-payment/${booking._id}`} className="py-2 px-4 bg-gray-200 rounded-md">Bank Details</Link>
              </div>
            </div>
          </>
        )}

        {booking.receiptUrl && (
          <div className="mt-4 text-sm">
            <div>Receipt: <a className="text-blue-600 underline" href={booking.receiptUrl} target="_blank" rel="noreferrer">View</a></div>
            {booking.receiptNote && <div className="text-sm text-gray-500 mt-1">Admin note: {booking.receiptNote}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
