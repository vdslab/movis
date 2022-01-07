import { createSelector, createSlice } from "@reduxjs/toolkit";

const initialState = {
  isDrawerOpen: false,
  isSearchModalOpen: false,
  isSelectedStatusModalOpen: false,
};

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    toggleDrawerOpen: (state) => {
      state.isDrawerOpen = !state.isDrawerOpen;
    },
    toggleSearchModalOpen: (state) => {
      state.isSearchModalOpen = !state.isSearchModalOpen;
    },
    toggleSelectedStatusModalOpen: (state) => {
      state.isSelectedStatusModalOpen = !state.isSelectedStatusModalOpen;
    },
  },
});

export const {
  toggleDrawerOpen,
  toggleSearchModalOpen,
  toggleSelectedStatusModalOpen,
} = appSlice.actions;

export const appReducer = appSlice.reducer;

export const selectApp = (state) => state.app;

export const selectIsDrawerOpen = createSelector(
  selectApp,
  (app) => app.isDrawerOpen
);

export const selectIsSearchModalOpen = createSelector(
  selectApp,
  (app) => app.isSearchModalOpen
);
export const selectIsSelectedStatusModalOpen = createSelector(
  selectApp,
  (app) => app.isSelectedStatusModalOpen
);
