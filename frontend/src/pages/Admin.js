// frontend/src/pages/Admin.js
import { useEffect, useState } from "react";
import axios from "../api/axios";
import toast from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Admin() {
  const [tab, setTab] = useState("dashboard");
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [dailyRevenue, setDailyRevenue] = useState([]);

  // ------------ Fetch Bookings ------------
  const fetchBookings = async () => {
    try {
      const res = await axios.get("/admin/bookings");
      setBookings(res.data);
      prepareDailyRevenue(res.data);
    } catch (err) {
      toast.error("Failed to load bookings");
    }
  };

  // ------------ Fetch Users ------------
  const fetchUsers = async () => {
    try {
      const res = await axios.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      toast.error("Failed to load users");
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchUsers();
  }, []);

  // ------------ Approve Booking ------------
  const approveBooking = async (id) => {
    try {
      await axios.patch(`/admin/bookings/${id}/approve`);
      toast.success("Booking approved & ticket sent!");
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Approval failed");
    }
  };

  // ------------ Prepare Daily Revenue Data ------------
  const prepareDailyRevenue = (bookings) => {
    const dailyMap = {};
    bookings.forEach((b) => {
      if (b.paymentStatus === "paid") {
        const day = new Date(b.createdAt).toLocaleDateString();
        dailyMap[day] = (dailyMap[day] || 0) + b.amount;
      }
    });
    const chartData = Object.keys(dailyMap).map((date) => ({
      date,
      revenue: dailyMap[date],
    }));
    setDailyRevenue(chartData);
  };

  // ------------ Calculate Totals ------------
  const totalRevenue = bookings
    .filter((b) => b.paymentStatus === "paid")
    .reduce((sum, b) => sum + b.amount, 0);

  const totalTicketsSold = bookings
    .filter((b) => b.paymentStatus === "paid")
    .reduce((sum, b) => sum + b.tickets, 0);

  const pendingBookings = bookings.filter(
    (b) => b.paymentStatus !== "paid" && b.receiptUrl
  ).length;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 mt-10 text-center">
        Admin Dashboard
      </h1>

      {/* ---------------- Tabs ---------------- */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setTab("dashboard")}
          className={`px-4 py-2 rounded ${
            tab === "dashboard" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setTab("bookings")}
          className={`px-4 py-2 rounded ${
            tab === "bookings" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Approve Bookings
        </button>
        <button
          onClick={() => setTab("users")}
          className={`px-4 py-2 rounded ${
            tab === "users" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          View Users
        </button>
        <button
          onClick={() => setTab("qr")}
          className={`px-4 py-2 rounded ${
            tab === "qr" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          QR Scan / Check-in
        </button>
      </div>

      {/* ---------------- Dashboard Tab ---------------- */}
      {tab === "dashboard" && (
        <div>
          <div className="mb-4 grid grid-cols-3 gap-4 text-center">
            <div className="bg-gray-100 p-4 rounded">
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-lg font-bold">LKR {totalRevenue}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded">
              <p className="text-sm text-gray-500">Tickets Sold</p>
              <p className="text-lg font-bold">{totalTicketsSold}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded">
              <p className="text-sm text-gray-500">Pending Bookings</p>
              <p className="text-lg font-bold">{pendingBookings}</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#3182CE" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {/* ---------------- Bookings Tab ---------------- */}
      {tab === "bookings" && (
        <div>

          <div className="overflow-x-auto mb-6">
            <table className="w-full border border-gray-300 rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 border">Booking Ref</th>
                  <th className="p-3 border">User</th>
                  <th className="p-3 border">Class</th>
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
                    <td className="border p-2">{b.bookingRef}</td>
                    <td className="border p-2">
                      {b.user?.firstName} {b.user?.lastName}
                      <br />
                      <span className="text-xs text-gray-500">{b.user?.email}</span>
                    </td>
                    <td className="border p-2">{b.class}</td>
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
                        b.receiptUrl.endsWith(".pdf") ? (
                          <a
                            href={b.receiptUrl}
                            target="_blank"
                            rel="noreferrer"
                            download
                            className="text-blue-600 underline"
                          >
                            Download PDF
                          </a>
                        ) : (
                          <a
                            href={b.receiptUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 underline"
                          >
                            View Receipt
                          </a>
                        )
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
      )}

      {/* ---------------- Users Tab ---------------- */}
      {tab === "users" && (
        <div>
          <div className="mb-4 text-center">
            <p className="text-gray-600 font-medium">
              Total Users Registered: {users.length}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 border">Name</th>
                  <th className="p-3 border">Email</th>
                  <th className="p-3 border">Contact</th>
                  <th className="p-3 border">Class</th>
                  <th className="p-3 border">Registered At</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="text-center">
                    <td className="border p-2">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="border p-2">{u.email}</td>
                    <td className="border p-2">{u.contactNumber || "-"}</td>
                    <td className="border p-2">{u.class || "-"}</td>
                    <td className="border p-2">
                      {new Date(u.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------- QR Tab Placeholder ---------------- */}
      {tab === "qr" && (
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-4">QR Scan / Check-in</h2>
          <p className="text-gray-500 font-medium">
            QR scanning functionality will be available soon.
          </p>
        </div>
      )}
    </div>
  );
}
