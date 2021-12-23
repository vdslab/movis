import { Box, Chip } from "@mui/material";
import { memo } from "react";

export const GenreItem = memo(function GenreItem({
  label,
  isSelected,
  onClick,
  id,
}) {
  return (
    <Chip
      label={label}
      color={isSelected ? "success" : void 0}
      onClick={() => onClick(id)}
      sx={{ m: 0.5 }}
    />
  );
});

export const RelatedGenreList = memo(function RelatedGenreList({
  personRelatedGenres,
  handleGenreItemClick,
}) {
  return (
    <Box>
      {personRelatedGenres.map((genre) => {
        return (
          <GenreItem
            id={genre.id}
            label={genre.name}
            isSelected={genre.isSelected}
            onClick={handleGenreItemClick}
            key={genre.id}
          />
        );
      })}
    </Box>
  );
});
