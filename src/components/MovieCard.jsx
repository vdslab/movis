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

import { Link } from "@/components/Link";

export const MovieCard = memo(function MovieCard({
  movieId,
  title,
  genres = [],
  productionYear,
  imgUrl,
  filterResult,
  selectedGenreIds,
  handleGenreClick,
  occupationNames,
}) {
  // ゴミ処理　とりあえずテーマっぽいカラーを120度ずつずらしたものなので、ベースのカラーも含めて必ず変更する
  const filterColor = {
    出演者: "error",
    製作年度: "warning",
    ジャンル: "success",
  };

  const filterKeys = ["出演者", "製作年度", "ジャンル"];

  return (
    <Card sx={{ display: "flex" }}>
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
                  <Chip
                    label={key}
                    color={filterColor[key]}
                    sx={{ m: 0.5 }}
                    size="small"
                    key={key}
                  />
                )
              );
            })}
        </Box>
        <Link href={`/movies/${movieId}`} passHref>
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
          <Link
            href={`/movies/${movieId}`}
            passHref
            // ゴミ処理かも
            sx={{ textDecoration: "none" }}
          >
            <Typography variant="subtitle1">{title}</Typography>
          </Link>
          <Typography variant="subtitle2">
            {productionYear + "年製作"}
          </Typography>
          {occupationNames?.length > 0 && (
            <Typography variant="subtitle2">
              役割：{occupationNames.join("/")}
            </Typography>
          )}
          <Box>
            {genres.map((genre) => {
              return (
                // ゴミ処理
                <Chip
                  size="small"
                  label={
                    genre.name.includes("・") &&
                    genre.name !== "アート・コンテンポラリー"
                      ? genre.name.split("・")[1]
                      : genre.name
                  }
                  variant="outlined"
                  color={
                    selectedGenreIds && selectedGenreIds.includes(genre.id)
                      ? "success"
                      : void 0
                  }
                  onClick={() => {
                    handleGenreClick && handleGenreClick(genre.id);
                  }}
                  key={genre.id}
                  sx={{ m: 0.5 }}
                />
              );
            })}
          </Box>
        </CardContent>
      </Box>
    </Card>
  );
});
