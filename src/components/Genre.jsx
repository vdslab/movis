import { Box, Chip } from "@mui/material";
import { memo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  selectSelectedGenreIds,
  toggleSelectedGenre,
} from "@/modules/features/app/slice";

const GenreListItem = memo(function GenreListItem({
  id,
  name,
  color,
  onClickGenre,
}) {
  return (
    <Chip
      label={name}
      color={color}
      sx={{ m: 0.5 }}
      onClick={() => {
        onClickGenre(id);
      }}
    />
  );
});

export const GenreList = memo(function GenreList({ relatedGenres }) {
  const dispatch = useDispatch();
  const selectedGenreIds = useSelector(selectSelectedGenreIds);

  const handleClickGenre = useCallback(
    (genreId) => {
      dispatch(toggleSelectedGenre(genreId));
    },
    [dispatch]
  );

  return (
    <Box>
      {relatedGenres.map((genre) => {
        const isSelected = selectedGenreIds.includes(genre.id);
        const color = isSelected ? "success" : void 0;

        return (
          <GenreListItem
            key={genre.id}
            id={genre.id}
            name={genre.name}
            color={color}
            onClickGenre={handleClickGenre}
          />
        );
      })}
    </Box>
  );
});
