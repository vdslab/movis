import {
  Container,
  List,
  Typography,
  Pagination,
  Box,
  Grid,
  Button,
} from "@mui/material";
import { useRouter } from "next/router";

import { MovieCard } from "@/components/MovieCard";
import prisma from "@/lib/prisma";
import { forceSerialize } from "@/util";

const TAKE = 10;

const MovieSearchResult = (props) => {
  console.log(props);
  const router = useRouter();
  const encodedName = encodeURIComponent(props.name);

  return (
    <Container maxWidth="xl" sx={{ my: 3 }}>
      <Box
        sx={{
          display: { xs: "block", sm: "flex" },
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography sx={{ mb: 2 }}>
          名前に「{props.name}」が含まれる映画
          <Box component="span" sx={{ mx: 1 }}>
            （{props.movieHitCount}件）
          </Box>
        </Typography>

        <Button
          onClick={() => {
            router.push(
              `/search/${encodedName}/person?movieHitCount=${props.movieHitCount}&personHitCount=${props.personHitCount}`
            );
          }}
          variant="contained"
        >
          人物の検索結果へ
        </Button>
      </Box>

      {/* movie list */}
      <List sx={{ width: "100%" }}>
        {props.movies.map((movie) => {
          const handleMovieClick = () => {
            router.push(`/movie/${movie.id}`);
          };
          return (
            <Grid
              item
              xs={12}
              sm={12}
              md={12}
              xl={12}
              sx={{ mx: 1, my: 2 }}
              key={movie.id}
            >
              <MovieCard
                movieId={movie.id}
                title={movie.title}
                genres={movie.genres}
                productionYear={movie.productionYear}
                imgUrl={movie.imgUrl}
                onMovieClick={handleMovieClick}
              />
            </Grid>
          );
        })}
      </List>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Pagination
          count={Math.floor(props.movieHitCount / TAKE) + 1}
          onChange={(e, v) => {
            router.push(
              `/search/${encodedName}/movie?movieHitCount=${props.movieHitCount}&personHitCount=${props.personHitCount}&page=${v}`
            );
          }}
          defaultPage={Number.isInteger(props.page) ? props.page : 1}
        />
      </Box>
    </Container>
  );
};

export const getServerSideProps = async (ctx) => {
  const { query } = ctx;
  const { name, movieHitCount, personHitCount, page } = query;

  const skip = Number.isInteger(Number(page))
    ? (Number(page) - 1 < 0 ? 0 : Number(page) - 1) * TAKE
    : 0;

  // とりあえず新しい順に
  const movies = await prisma.movie.findMany({
    where: {
      title: {
        contains: name,
      },
    },
    select: {
      title: true,
      id: true,
      productionYear: true,
      imgUrl: true,
      originalTitle: true,
      runtime: true,
      genres: true,
    },
    orderBy: {
      productionYear: "desc",
    },
    skip,
    take: TAKE,
  });

  return {
    props: forceSerialize({
      name,
      movieHitCount,
      personHitCount,
      movies,
      page,
    }),
  };
};

export default MovieSearchResult;
