import { configureStore } from "@reduxjs/toolkit";

import { appReducer } from "@/modules/features/app/appSlice";

export const store = configureStore({
  reducer: { app: appReducer },
  devTools: process.env.NODE_ENV !== "production",
});
