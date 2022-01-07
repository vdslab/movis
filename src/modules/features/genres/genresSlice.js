import {
  createSlice,
  createEntityAdapter,
  createSelector,
} from "@reduxjs/toolkit";

const genresAdapter = createEntityAdapter({
  selectId: (genre) => genre.id,
  sortComparer: (a, b) => a.id - b.id,
});

// ゴミ処理
// const initialState = genresAdapter.getInitialState();

const initialState = {
  genres: genresAdapter.getInitialState(),
  selectedGenre: "",
  countryRelatedGenres: [],
};

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
      genresAdapter.setAll(state.genres, genres);
    },
    resetGenres: (state) => {
      const reseted = state.genres.ids.map((id) => ({
        ...state.genres.entities[id],
        isSelected: false,
        isPersonRelated: false,
      }));
      genresAdapter.upsertMany(state.genres, reseted);
    },
    toggleSelectedGenre: (state, action) => {
      const genreId = action.payload;
      genresAdapter.upsertOne(state.genres, {
        ...state.genres.entities[genreId],
        isSelected: !state.genres.entities[genreId].isSelected,
      });
    },
    toggleSelectedSingleGenre: (state, action) => {
      const genreId = action.payload;
      state.selectedGenre = genreId;
    },
    // いらないかも
    setPersonRelatedGenres: (state, action) => {
      const personRelatedGenres = action.payload.map((id) => ({
        id,
        isPersonRelated: true,
      }));
      genresAdapter.upsertMany(state.genres, personRelatedGenres);
    },
    loadCountryRelatedGenres: (state, action) => {
      state.countryRelatedGenres = action.payload;
    },
  },
});

export const {
  loadGenres,
  resetGenres,
  toggleSelectedGenre,
  setPersonRelatedGenres,
  loadCountryRelatedGenres,
  toggleSelectedSingleGenre,
} = genresSlice.actions;

export const genresReducer = genresSlice.reducer;

export const selectGenres = genresAdapter.getSelectors(
  (state) => state.genres.genres
);

export const selectSelectedGenres = createSelector(
  selectGenres.selectAll,
  (genres) => genres.filter((genre) => genre.isSelected)
);

export const selectPersonRelatedGenres = createSelector(
  selectGenres.selectAll,
  (genres) => genres.filter((genre) => genre.isPersonRelated)
);

export const selectSelectedGenre = (state) => state.genres.selectedGenre;

export const selectCountryRelatedGenres = (state) =>
  state.genres.countryRelatedGenres;
