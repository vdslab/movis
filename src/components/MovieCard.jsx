import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Typography,
  Box,
} from "@mui/material";
import { memo } from "react";

import { GenreList } from "@/components/Genre";
import { Link } from "@/components/Link";

const MovieCardMediaLink = memo(function MovieCardMedia({
  movieId,
  imgUrl,
  title,
}) {
  return (
    <Link href={`/movies/${movieId}`} passHref>
      <CardMedia
        component="img"
        sx={{ width: 130, height: 182, m: 0 }}
        image={imgUrl}
        alt={`${title}のポスター`}
      />
    </Link>
  );
});

const FilterResultChip = memo(function FilterResultChip({ label, color }) {
  return <Chip label={label} color={color} sx={{ m: 0.5 }} size="small" />;
});

const MovieCardActionArea = memo(function MovieCardActionArea({
  movieId,
  title,
  imgUrl,
  filterResult,
}) {
  const filterColor = {
    出演者: "error",
    製作年度: "warning",
    ジャンル: "success",
  };

  const filterKeys = ["出演者", "製作年度", "ジャンル"];
  return (
    <CardActionArea sx={{ width: 130, position: "relative" }}>
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        {filterResult &&
          filterKeys.map((key) => {
            return (
              filterResult[key] && (
                <FilterResultChip
                  color={filterColor[key]}
                  key={key}
                  label={key}
                />
              )
            );
          })}
      </Box>
      <MovieCardMediaLink movieId={movieId} imgUrl={imgUrl} title={title} />
    </CardActionArea>
  );
});

const MovieCardContentTexts = memo(function MovieCardContent({
  movieId,
  title,
  productionYear,
  occupationNames,
}) {
  return (
    <Box>
      <Link
        href={`/movies/${movieId}`}
        passHref
        // ゴミ処理かも
        sx={{ textDecoration: "none" }}
      >
        <Typography variant="subtitle1">{title}</Typography>
      </Link>
      <Typography variant="subtitle2">{productionYear + "年製作"}</Typography>
      {occupationNames?.length > 0 && (
        <Typography variant="subtitle2">
          役割：{occupationNames.join("/")}
        </Typography>
      )}
    </Box>
  );
});

export const MovieCard = memo(function MovieCard({
  movieId,
  title,
  imgUrl,
  filterResult,
  genres = [],
  productionYear,
  occupationNames,
}) {
  return (
    <Card sx={{ display: "flex" }}>
      <MovieCardActionArea
        movieId={movieId}
        title={title}
        imgUrl={imgUrl}
        filterResult={filterResult}
      />
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <CardContent sx={{ flex: "1 0 auto" }}>
          <MovieCardContentTexts
            movieId={movieId}
            title={title}
            productionYear={productionYear}
            occupationNames={occupationNames}
          />
          <Box>
            <GenreList relatedGenres={genres} chipVariant="outlined" />
          </Box>
        </CardContent>
      </Box>
    </Card>
  );
});
