//frontend\src\redux\bookingSlice.js
import { createSlice } from "@reduxjs/toolkit";

const bookingSlice = createSlice({
  name: "bookings",
  initialState: { list: [] },
  reducers: {
    setBookings: (state, action) => {
      state.list = action.payload;
    },
    addBooking: (state, action) => {
      state.list.push(action.payload);
    },
  },
});

export const { setBookings, addBooking } = bookingSlice.actions;
export default bookingSlice.reducer;
