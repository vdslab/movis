import { createSlice, createEntityAdapter } from "@reduxjs/toolkit";

const genresAdapter = createEntityAdapter({
  selectId: (genre) => genre.id,
  sortComparer: (a, b) => b.id - a.id,
});

const initialState = genresAdapter.getInitialState();

export const genresSlice = createSlice({
  name: "genres",
  initialState,
  reducers: {
    loadGenres: (state, action) => {
      const genres = action.payload.map((genre) => ({
        ...genre,
        isSelected: false,
        isPersonHas: false,
      }));
      genresAdapter.setAll(state, genres);
    },
    resetGenres: (state) => {
      const reseted = state.ids.map((id) => ({
        ...state.entities[id],
        isSelected: false,
        isPersonHas: false,
      }));
      genresAdapter.upsertMany(state, reseted);
    },
    toggleSelectedGenre: (state, action) => {
      const genreId = action.payload;
      genresAdapter.upsertOne(state, {
        ...state.entities[genreId],
        isSelected: !state.entities[genreId].isSelected,
      });
    },
    setPersonHas: (state, action) => {
      const personHas = action.payload.map((id) => ({ id, isPersonHas: true }));
      genresAdapter.upsertMany(state, personHas);
    },
  },
});

export const { loadGenres, resetGenres, toggleSelectedGenre, setPersonHas } =
  genresSlice.actions;

export const genresReducer = genresSlice.reducer;

export const selectGenres = genresAdapter.getSelectors((state) => state.genres);
