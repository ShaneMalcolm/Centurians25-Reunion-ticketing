import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Booking from "./pages/Booking";
import Payment from "./pages/Payment";
import Success from "./pages/Success";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import FakePayment from "./pages/FakePayment";
import PaymentSuccess from "./pages/PaymentSuccess";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/booking/:id?" element={<Booking />} />
        <Route path="/payment/:bookingId" element={<FakePayment />} />
        <Route path="/success/:bookingId" element={<PaymentSuccess />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;
