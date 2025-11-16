import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  return token ? (
    children
  ) : (
    <Navigate
      to="/login"
      state={{ msg: "Please login to continue booking" }}
      replace
    />
  );
}
