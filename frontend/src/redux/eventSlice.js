import { createSlice } from "@reduxjs/toolkit";

const eventSlice = createSlice({
  name: "event",
  initialState: { data: null },
  reducers: {
    setEvent: (state, action) => {
      state.data = action.payload;
    },
  },
});

export const { setEvent } = eventSlice.actions;
export default eventSlice.reducer;
