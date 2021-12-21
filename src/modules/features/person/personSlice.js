import { createSlice, createEntityAdapter } from "@reduxjs/toolkit";

const moviesAdapter = createEntityAdapter({
  selectId: (movie) => movie.id,
  sortComparer: (a, b) => b.productionYear - a.productionYear,
});

const initialState = {
  person: null,
  movies: moviesAdapter.getInitialState(),
};

export const personSlice = createSlice({
  name: "person",
  initialState,
  reducers: {
    loadPerson: (state, action) => {
      state.person = { ...action.payload };
    },
    setPersonMovies: (state, action) => {
      const movies = action.payload.map((movie) => ({
        ...movie,
        filteredByNode: false,
        filteredByGenre: false,
        filteredByYear: false,
      }));
      moviesAdapter.setAll(state.movies, movies);
    },
    removePerson: (state) => {
      state.person = null;
      moviesAdapter.removeAll(state.movies);
    },
    toggleFilteredMovies: (state, action) => {
      moviesAdapter.upsertMany(state.movies, action.payload);
    },
  },
});

export const { loadPerson, setPersonMovies, removePerson } =
  personSlice.actions;

export const personReducer = personSlice.reducer;

export const selectPerson = (state) => state.person.person;

export const selectPersonMovies = moviesAdapter.getSelectors(
  (state) => state.person.movies
);
