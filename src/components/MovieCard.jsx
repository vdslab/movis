import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Typography,
  Box,
} from "@mui/material";

import { Link } from "@/components/Link";

export const MovieCard = ({
  movieId,
  title,
  genres,
  productionYear,
  imgUrl,
  filterResult,
  selectedGenreIds,
  handleGenreClick,
}) => {
  // ゴミ処理　とりあえずテーマっぽいカラーを120度ずつずらしたものなので、ベースのカラーも含めて必ず変更する
  const filterColor = {
    network: "error",
    year: "warning",
    genre: "success",
  };

  return (
    <Card sx={{ display: "flex" }}>
      <CardActionArea sx={{ width: 130 }}>
        <Link href={`/movie/${movieId}`} passHref>
          <CardMedia
            component="img"
            sx={{ width: 130, height: 182, m: 0 }}
            image={imgUrl}
            alt={`${title}のポスター`}
          />
        </Link>
      </CardActionArea>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <CardContent sx={{ flex: "1 0 auto" }}>
          <Box>
            {filterResult &&
              Object.keys(filterResult).map((key) => {
                return (
                  filterResult[key] && (
                    <Chip
                      label={key}
                      color={filterColor[key]}
                      sx={{ m: "2px" }}
                      key={key}
                    />
                  )
                );
              })}
          </Box>
          <Link
            href={`/movie/${movieId}`}
            // ゴミ処理かも
            sx={{ textDecoration: "none", color: "black" }}
          >
            <Typography variant="subtitle1">{title}</Typography>
          </Link>
          <Typography variant="subtitle2">
            {productionYear + "年製作"}
          </Typography>
          <Box>
            {genres.map((genre) => {
              return (
                // ゴミ処理
                <Chip
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
                    handleGenreClick && handleGenreClick(genre.id);
                  }}
                  key={genre.id}
                  sx={{ m: "2px" }}
                />
              );
            })}
          </Box>
        </CardContent>
      </Box>
    </Card>
  );
};
