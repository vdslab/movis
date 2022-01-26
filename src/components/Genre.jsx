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
  variant,
}) {
  return (
    <Chip
      label={
        name.includes("・") &&
        name !== "アート・コンテンポラリー" &&
        variant !== "filled"
          ? name.split("・")[1]
          : name
      }
      size={variant === "filled" ? "medium" : "small"}
      color={color}
      sx={{ m: variant === "filled" ? 0.5 : "1px" }}
      onClick={
        variant === "filled"
          ? () => {
              onClickGenre(id);
            }
          : void 0
      }
      variant={variant}
    />
  );
});

export const GenreList = memo(function GenreList({
  relatedGenres,
  chipVariant = "filled",
}) {
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
            variant={chipVariant}
          />
        );
      })}
    </Box>
  );
});
