import { useEffect, useState } from "react";
import axios from "../api/axios";
import toast from "react-hot-toast";

export default function Admin() {
  const [bookings, setBookings] = useState([]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/admin/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(res.data);
    } catch (err) {
      toast.error("Failed to load bookings");
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const approveBooking = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `/admin/bookings/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Booking approved & ticket sent!");
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Approval failed");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 mt-10 text-center">Admin Dashboard</h1>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">User</th>
              <th className="p-3 border">Booking Ref</th>
              <th className="p-3 border">Tickets</th>
              <th className="p-3 border">Amount</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Receipt</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>

          <tbody>
            {bookings.map((b) => (
              <tr key={b._id} className="text-center">
                <td className="border p-2">
                  {b.user?.firstName} {b.user?.lastName}
                  <br />
                  <span className="text-xs text-gray-500">{b.user?.email}</span>
                </td>

                <td className="border p-2">{b.bookingRef}</td>
                <td className="border p-2">{b.tickets}</td>
                <td className="border p-2">LKR {b.amount}</td>

                <td className="border p-2">
                  {b.paymentStatus === "paid" ? (
                    <span className="text-green-600 font-semibold">PAID</span>
                  ) : b.receiptUrl ? (
                    <span className="text-yellow-600 font-semibold">PENDING</span>
                  ) : (
                    <span className="text-red-500 font-semibold">UNPAID</span>
                  )}
                </td>

                <td className="border p-2">
  {b.receiptUrl ? (
    (() => {
      const isPDF = b.receiptUrl.endsWith(".pdf");
      return (
        <a
          href={b.receiptUrl}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 underline"
          {...(isPDF ? { download: true } : {})} // force download if PDF
        >
          {isPDF ? "Download PDF" : "View Receipt"}
        </a>
      );
    })()
  ) : (
    "No Receipt"
  )}
</td>


                <td className="border p-2">
                  {b.paymentStatus === "paid" ? (
                    <span className="text-gray-400">Approved</span>
                  ) : b.receiptUrl ? (
                    <button
                      onClick={() => approveBooking(b._id)}
                      className="px-4 py-1 bg-green-600 text-white rounded"
                    >
                      Approve
                    </button>
                  ) : (
                    <span className="text-gray-400">Waiting for receipt</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
