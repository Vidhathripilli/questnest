import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedPlan: null,
};

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {
    setSelectedPlan: (state, action) => {
      state.selectedPlan = action.payload;
    },
  },
});

export const { setSelectedPlan } = subscriptionSlice.actions; // ✅ Ensure this line is correct
export default subscriptionSlice.reducer;
