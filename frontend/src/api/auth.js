import axios from "./axios";

export const registerUser = async (data) => {
  return await axios.post("/auth/register", data);
};

export const loginUser = async (data) => {
  return await axios.post("/auth/login", data);
};
