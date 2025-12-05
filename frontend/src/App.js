//frontend\src\App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Booking from "./pages/Booking";
import Admin from "./pages/Admin";
import PaymentSuccess from "./pages/PaymentSuccess";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Navbar from "./components/Navbar";
import UserProfile from "./pages/UserProfile";
import ManualPayment from "./pages/ManualPayment";
import ProfileBookings from "./pages/ProfileBookings";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/booking/:id?" element={<ProtectedRoute> <Booking /> </ProtectedRoute> } />
        {/* <Route path="/payment/:bookingId" element={<ProtectedRoute> <FakePayment /> </ProtectedRoute>} /> */}
        <Route path="/success/:bookingId" element={<ProtectedRoute> <PaymentSuccess /> </ProtectedRoute>} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/profilebookings" element={<ProfileBookings />} />
        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
        <Route path="/manual-payment/:bookingId" element={<ProtectedRoute> <ManualPayment /> </ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
