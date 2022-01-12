import { Box, Chip, Typography } from "@mui/material";
import { memo } from "react";

const GenreListItem = memo(function GenreListItem({
  id,
  name,
  isSelected,
  onClick,
}) {
  return (
    <Chip
      id={id}
      label={name}
      color={isSelected ? "success" : void 0}
      onClick={() => onClick(id)}
      sx={{ m: 0.5 }}
    />
  );
});

const GenreList = memo(function GenreList({
  relatedGenres,
  handleItemClick,
  selectedGenreIds,
}) {
  return (
    <Box>
      {relatedGenres.map((genre) => {
        return (
          <GenreListItem
            key={genre.id}
            id={genre.id}
            name={genre.name}
            isSelected={selectedGenreIds.includes(genre.id)}
            onClick={handleItemClick}
          />
        );
      })}
    </Box>
  );
});

export const GenreSection = memo(function GenreSection({
  name,
  relatedGenres,
  handleGenreItemClick,
  selectedGenreIds,
}) {
  return (
    <Box>
      <Typography sx={{ p: 1, display: "flex", alignItems: "center" }}>
        {name}が制作に携わった映画の
        <Chip label="ジャンル" color="success" sx={{ m: 0.5 }} size="small" />
        を選択して、映画を絞り込みましょう
      </Typography>

      <GenreList
        relatedGenres={relatedGenres}
        handleItemClick={handleGenreItemClick}
        selectedGenreIds={selectedGenreIds}
      />
    </Box>
  );
});
