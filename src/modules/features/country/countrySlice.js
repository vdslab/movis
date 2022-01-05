import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";

const countriesAdapter = createEntityAdapter({
  selectId: (country) => country.id,
});

const initialState = {
  countries: countriesAdapter.getInitialState(),
  selectedCountry: "",
};

export const countrySlice = createSlice({
  name: "country",
  initialState,
  reducers: {
    loadCountries: (state, action) => {
      countriesAdapter.setAll(state.countries, action.payload);
    },
    toggleSelectedCountry: (state, action) => {
      const countryId = action.payload;
      state.selectedCountry = countryId;
    },
  },
});

export const { loadCountries, toggleSelectedCountry } = countrySlice.actions;

export const countryReducer = countrySlice.reducer;

export const selectCountries = countriesAdapter.getSelectors(
  (state) => state.country.countries
);

export const selectSelectedCountry = (state) => state.country.selectedCountry;
