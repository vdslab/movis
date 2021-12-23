import { createSelector, createSlice } from "@reduxjs/toolkit";

const TARGET = {
  selected: {
    node: "nodeIds",
    genre: "genreIds",
    year: "years",
  },
  filteredMovieIds: {
    node: "node",
    genre: "genre",
    year: "year",
  },
};

const initialState = {
  selected: {
    nodeIds: [],
    genreIds: [],
    years: [],
  },
  filteredMovieIds: {
    node: [],
    genre: [],
    year: [],
  },
  person: {
    movies: [],
    genreIds: [],
    relatedPeople: [],
    years: [],
  },
  isDrawerOpen: false,
};

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    toggleDrawerOpen: (state) => {
      state.isDrawerOpen = !state.isDrawerOpen;
    },
    // ゴミ処理　死ぬほど使いにくい
    toggleSelected: (state, action) => {
      const { target, value } = action.payload;
      const selectedTarget = TARGET.selected[target];

      const newState = [...state.selected[selectedTarget]];
      const index = newState.indexOf(value);

      if (index < 0) {
        newState.push(value);
      } else {
        newState.splice(index, 1);
      }

      state.selected[selectedTarget] = newState;
    },
    // setFilteredMovieIds: (state, action) => {
    //   const { target, value } = action.payload;
    //   const filteredTarget = TARGET.filteredMovieIds[target];

    //   state.filteredMovieIds[filteredTarget] = [...value];
    // },
    clearSelection: (state, action) => {
      const { target } = action.payload;
      const selectedTarget = TARGET.selected[target];
      // const filteredTarget = TARGET.filteredMovieIds[target];

      state.selected[selectedTarget] = [];
      // state.filteredMovieIds[filteredTarget] = movieIds;
    },
    clearAllSelection: (state) => {
      state.selected = initialState.selected;
      state.person = initialState.person;
      // state.filteredMovieIds = initialState.filteredMovieIds;
    },
    setPersonMovies: (state, action) => {
      state.person.movies = [...action.payload];
    },
    setPersonGenreIds: (state, action) => {
      state.person.genreIds = [...action.payload];
    },
    // ゴミ処理　selectedNodeIdsとまとめられる
    setPersonRelatedPeople: (state, action) => {
      state.person.relatedPeople = [...action.payload];
    },
    setPersonYears: (state, action) => {
      state.person.years = [...action.payload];
    },
  },
});

export const {
  toggleDrawerOpen,
  toggleSelected,
  setFilteredMovieIds,
  clearSelection,
  clearAllSelection,
  setPersonMovies,
  setPersonGenreIds,
  setPersonRelatedPeople,
} = appSlice.actions;

export const appReducer = appSlice.reducer;

export const selectApp = (state) => state.app;

export const selectIsDrawerOpen = createSelector(
  selectApp,
  (app) => app.isDrawerOpen
);
