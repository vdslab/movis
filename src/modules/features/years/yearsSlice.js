import {
  createEntityAdapter,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";

const yearsAdapter = createEntityAdapter({
  selectId: (year) => year.year,
  sortComparer: (a, b) => a.year - b.year,
});

const initialState = yearsAdapter.getInitialState();

export const yearsSlice = createSlice({
  name: "years",
  initialState,
  reducers: {
    loadYears: (state, action) => {
      const years = action.payload.map((year) => ({ year, isSelected: false }));
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
        Object.values(state.entities).map((entity) => ({
          ...entity,
          isSelected: false,
        }))
      );
    },
    removeYears: (state) => {
      yearsAdapter.removeAll(state);
    },
  },
});

export const {
  loadYears,
  toggleSelectedYear,
  resetYearSelection,
  removeYears,
} = yearsSlice.actions;

export const yearsReducer = yearsSlice.reducer;

export const selectYears = yearsAdapter.getSelectors((state) => state.years);

export const selectSelectedYears = createSelector(
  selectYears.selectAll,
  (years) => years.filter((year) => year.isSelected)
);
