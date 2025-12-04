/**
 * Handles successful login/registration:
 * - Saves token & user to localStorage
 * - Redirects to Home page
 */
export const handleAuthSuccess = (data, navigate, redirect = "/") => {
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  navigate(redirect);
};


export const handleLogout = (navigate) => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  navigate("/login");
};

