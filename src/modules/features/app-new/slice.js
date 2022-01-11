import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";

const selectedNodeAdapter = createEntityAdapter({});

const relatedGenreAdapter = createEntityAdapter({});

const initialState = {
  isSearchOpen: false,
  isSelectionOpen: false,
  keyword: "",
  node: {
    selected: selectedNodeAdapter.getInitialState(),
  },
  genre: { related: relatedGenreAdapter.getInitialState(), selectedIds: [] },
  year: { related: [], selected: [] },
};

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    toggleSearchOpen: (state) => {
      state.isSearchOpen = !state.isSearchOpen;
    },
    toggleSelectionOpen: (state) => {
      state.isSelectionOpen = !state.isSelectionOpen;
    },
    toggleSelectedNode: (state, action) => {
      const selectedNodeState = state.node.selected;
      const node = action.payload;
      // node = {
      //   id,
      //   name,
      // }

      const selectedNodeIds = state.node.selected.ids;
      const isSelected = selectedNodeIds.includes(node.id);

      if (isSelected) {
        selectedNodeAdapter.removeOne(selectedNodeState, node.id);
      } else {
        selectedNodeAdapter.addOne(selectedNodeState, {
          id: node.id,
          name: node.name,
        });
      }
    },
    toggleSelectedGenre: (state, action) => {
      const selectedGenreIdsState = state.genre.selectedIds;
      const genreId = action.payload;
      const index = selectedGenreIdsState.indexOf(genreId);
      const selectedGenreIdsCopy = Array.from(selectedGenreIdsState);

      if (index < 0) {
        selectedGenreIdsCopy.push(genreId);
      } else {
        selectedGenreIdsCopy.splice(index, 1);
      }

      state.genre.selectedIds = selectedGenreIdsCopy;
    },
    toggleSelectedYear: (state, action) => {
      const currentSelectedYears = state.year.selected;
      const yearId = action.payload;
      const index = currentSelectedYears.indexOf(yearId);
      const copiedSelectedYears = Array.from(currentSelectedYears);

      if (index < 0) {
        copiedSelectedYears.push(yearId);
      } else {
        copiedSelectedYears.splice(index, 1);
      }

      state.year.selected = copiedSelectedYears;
    },
    setRelatedGenre: (state, action) => {
      const relatedGenreState = state.genre.related;
      const genres = action.payload;
      // genre = [{
      //   id,
      //   name
      // }]

      relatedGenreAdapter.setAll(relatedGenreState, genres);
    },
    setRelatedYear: (state, action) => {
      state.year.related = action.payload;
    },
    resetYear: (state) => {
      state.year = initialState.year;
    },
    resetGenre: (state) => {
      state.genre = initialState.genre;
    },
    resetNode: (state) => {
      state.node = initialState.node;
    },
    setKeyword: (state, action) => {
      state.keyword = action.payload;
    },
    clearKeyword: (state) => {
      state.keyword = "";
    },
  },
});

export const {
  toggleSearchOpen,
  toggleSelectionOpen,
  toggleSelectedNode,
  toggleSelectedGenre,
  toggleSelectedYear,
  setRelatedGenre,
  setRelatedYear,
  resetYear,
  resetGenre,
  resetNode,
  setKeyword,
  clearKeyword,
} = appSlice.actions;

export const newAppReducer = appSlice.reducer;

export const selectedNodeSelectors = selectedNodeAdapter.getSelectors(
  (state) => state.newApp.node.selected
);

export const selectSelectedGenreIds = (state) => state.newApp.genre.selectedIds;

export const relatedGenreSelectors = relatedGenreAdapter.getSelectors(
  (state) => state.newApp.genre.related
);

export const selectSelectedYears = (state) => state.newApp.year.selected;

export const selectRelatedYears = (state) => state.newApp.year.related;

export const selectIsSearchOpen = (state) => state.newApp.isSearchOpen;

export const selectIsSelectionOpen = (state) => state.newApp.isSelectionOpen;

export const selectKeyword = (state) => state.newApp.keyword;
