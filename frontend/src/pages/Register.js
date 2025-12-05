//frontend\src\pages\Register.js
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { handleAuthSuccess } from "../utils/auth";
import toast from "react-hot-toast";
import PasswordInput from "../components/PasswordVisibility";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
  firstName: "",
  lastName: "",
  class: "",
  contactNumber: "",
  email: "",
  password: ""
});


  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.firstName || !form.lastName || !form.email || !form.password || !form.class || !form.contactNumber) {
      toast.error("Please fill in all fields");
      return;
    }

    // --- Email validation ---
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error("Enter a valid email address");
      return;
    }

    // Frontend password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,}$/;
    if (!passwordRegex.test(form.password)) {
      toast.error("Password must be 8+ chars, include uppercase, lowercase, number & special char.");
      return;
    }

    try {
      const res = await axios.post("/auth/register", form);
      toast.success(`Account created successfully! Welcome, ${res.data.user.firstName}!`);

      setTimeout(() => {
        handleAuthSuccess(res.data, navigate);
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.msg || "Registration failed");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-50">
        <h2 className="text-4xl font-bold text-center">Create Account</h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block mb-1 font-medium">First Name</label>
              <input
                name="firstName"
                placeholder="First Name"
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex-1">
              <label className="block mb-1 font-medium">Last Name</label>
              <input
                name="lastName"
                placeholder="Last Name"
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex gap-4">
  <div className="flex-1">
    <label className="block mb-1 font-medium">Class</label>
    <input
      name="class"
      placeholder="ex:COM 1 / BIO 2" 
      onChange={handleChange}
      className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      required
    />
  </div>

  <div className="flex-1">
    <label className="block mb-1 font-medium">Contact Number</label>
    <input
      name="contactNumber"
      placeholder="07X-XXXXXXX"
      onChange={handleChange}
      className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      required
    />
  </div>
</div>

          <div>
  <label className="block mb-1 font-medium">Email</label>
  <input
    name="email"
    placeholder="Enter your email"
    onChange={handleChange}
    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
    required
  />
  <p className="text-sm font-semibold mt-1 bg-yellow-100 text-red-700 p-2 rounded">
  ⚠️ Please use a valid and working email address — your ticket will be issued to this email.
</p>


</div>

          <div>
            <label className="block mb-1 font-medium">Password</label>
            <PasswordInput
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Enter your password"
            />
          </div>

          <div className="text-center mt-4">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded transition"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
