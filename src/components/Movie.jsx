import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  CardMedia,
  Chip,
  Typography,
} from "@mui/material";
import { memo } from "react";

import { Link } from "@/components/Link";

export const Movie = memo(function Movie({
  title,
  id,
  imgUrl,
  productionYear,
  genres,
  onGenreClick,
  filterResult,
  occupationNames,
  selectedGenreIds,
}) {
  return (
    <Card>
      <CardHeader
        title={
          <Link href={`/movies/${id}`}>
            <Typography
              variant="subtitle1"
              noWrap
              sx={{
                width: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {title}
            </Typography>
          </Link>
        }
      />
      <Box sx={{ display: "flex" }}>
        <CardActionArea sx={{ width: 130 }}>
          <Link href={`/movies/${id}`}>
            <CardMedia
              component={"img"}
              sx={{ width: 130, height: 182, m: 0 }}
              image={imgUrl}
              alt={`${title}のポスター`}
            />
          </Link>
        </CardActionArea>
        <CardContent sx={{ display: "flex", flexDirection: "column" }}>
          <Box>
            <Typography variant="subtitle2">
              {`${productionYear}年制作`}
            </Typography>
            {occupationNames.map((name) => {
              return (
                <Typography variant="subtitle2" key={name}>
                  {name}
                </Typography>
              );
            })}
            {genres.map((genre) => {
              return (
                <Chip
                  key={genre.id}
                  size="small"
                  label={
                    genre.name.includes("・") &&
                    genre.name !== "アート・コンテンポラリー"
                      ? genre.name.split("・")[1]
                      : genre.name
                  }
                  color={
                    selectedGenreIds && selectedGenreIds.includes(genre.id)
                      ? "success"
                      : void 0
                  }
                  onClick={() => {
                    onGenreClick && onGenreClick(genre.id);
                  }}
                  sx={{ m: "2px" }}
                />
              );
            })}
          </Box>
          <Box>
            {filterResult &&
              Object.keys(filterResult).map((key) => {
                return (
                  <Chip
                    key={key}
                    color={"#ff8834"}
                    sx={{ m: "2px" }}
                    size="small"
                  />
                );
              })}
          </Box>
        </CardContent>
      </Box>
    </Card>
  );
});
