import { configureStore } from "@reduxjs/toolkit";

import { appReducer } from "@/modules/features/app/appSlice";
import { genresReducer } from "@/modules/features/genres/genresSlice";
import { networkReducer } from "@/modules/features/network/networkSlice";
import { personReducer } from "@/modules/features/person/personSlice";
import { yearsReducer } from "@/modules/features/years/yearsSlice";

export const store = configureStore({
  reducer: {
    app: appReducer,
    genres: genresReducer,
    network: networkReducer,
    person: personReducer,
    years: yearsReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});
