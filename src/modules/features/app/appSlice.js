import { createSelector, createSlice } from "@reduxjs/toolkit";

const initialState = {
  isDrawerOpen: false,
};

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    toggleDrawerOpen: (state) => {
      state.isDrawerOpen = !state.isDrawerOpen;
    },
  },
});

export const { toggleDrawerOpen } = appSlice.actions;

export const appReducer = appSlice.reducer;

export const selectApp = (state) => state.app;

export const selectIsDrawerOpen = createSelector(
  selectApp,
  (app) => app.isDrawerOpen
);
