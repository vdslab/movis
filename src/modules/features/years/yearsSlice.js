import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";

const yearsAdapter = createEntityAdapter({
  selectId: (year) => year.year,
});

const initialState = yearsAdapter.getInitialState();

export const yearsSlice = createSlice({
  name: "years",
  initialState,
  reducers: {
    loadYears: (state, action) => {
      const { start, end } = action.payload;
      const years = [];
      for (let year = start; year <= end; ++year) {
        years.push({ year, isSelected: false });
      }
      yearsAdapter.setAll(state, years);
    },
    toggleSelectedYear: (state, action) => {
      const year = action.payload;
      yearsAdapter.upsertOne(state, {
        ...state.entities[year],
        isSelected: !state.entities[year].isSelected,
      });
    },
    resetYearSelection: (state) => {
      yearsAdapter.upsertMany(
        state,
        state.entities.map((entity) => ({ ...entity, isSelected: false }))
      );
    },
  },
});

export const { loadYears, toggleSelectedYear, resetYearSelection } =
  yearsSlice.actions;

export const yearsReducer = yearsSlice.reducer;

export const selectYears = yearsAdapter.getSelectors((state) => state.years);
