// frontend/src/components/AdminRoute.js
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  if (!token) {
    return <Navigate to="/login" state={{ msg: "Please login first" }} replace />;
  }

  if (!user?.isAdmin) {
    return <Navigate to="/" state={{ msg: "Access denied" }} replace />;
  }

  return children;
}
