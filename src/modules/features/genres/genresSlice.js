import {
  createSlice,
  createEntityAdapter,
  createSelector,
} from "@reduxjs/toolkit";

const genresAdapter = createEntityAdapter({
  selectId: (genre) => genre.id,
  sortComparer: (a, b) => a.id - b.id,
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
        isPersonRelated: genre.isPersonRelated,
      }));
      genresAdapter.setAll(state, genres);
    },
    resetGenres: (state) => {
      const reseted = state.ids.map((id) => ({
        ...state.entities[id],
        isSelected: false,
        isPersonRelated: false,
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
    // いらないかも
    setPersonRelatedGenres: (state, action) => {
      const personRelatedGenres = action.payload.map((id) => ({
        id,
        isPersonRelated: true,
      }));
      genresAdapter.upsertMany(state, personRelatedGenres);
    },
  },
});

export const {
  loadGenres,
  resetGenres,
  toggleSelectedGenre,
  setPersonRelatedGenres,
} = genresSlice.actions;

export const genresReducer = genresSlice.reducer;

export const selectGenres = genresAdapter.getSelectors((state) => state.genres);

export const selectSelectedGenres = createSelector(
  selectGenres.selectAll,
  (genres) => genres.filter((genre) => genre.isSelected)
);

export const selectPersonRelatedGenres = createSelector(
  selectGenres.selectAll,
  (genres) => genres.filter((genre) => genre.isPersonRelated)
);
