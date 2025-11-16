/**
 * Handles successful login/registration:
 * - Saves token & user to localStorage
 * - Redirects to Home page
 */
export const handleAuthSuccess = (data, navigate) => {
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  navigate("/"); // redirect to Home page (or "/event" if you prefer)
};

export const handleLogout = (navigate) => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  navigate("/login");
};

