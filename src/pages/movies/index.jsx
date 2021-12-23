import {
  Container,
  List,
  Typography,
  Pagination,
  Box,
  Grid,
  Button,
} from "@mui/material";

import { MovieCard } from "@/components/MovieCard";
import { SEARCH_LIMIT } from "@/const";
import prisma from "@/lib/prisma";
import { forceSerialize } from "@/util";

const MovieSearchResult = (props) => {
  const router = useRouter();
  const encodedKeyword = encodeURIComponent(props.name);

  return (
    <Container maxWidth="xl" sx={{ my: 3 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { sm: "center" },
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
              `/people?keyword${encodedKeyword}&movieHitCount=${props.movieHitCount}&personHitCount=${props.personHitCount}`
            );
          }}
          variant="contained"
          color="primary"
          sx={{ alignSelf: "flex-end" }}
          disabled={props.personHitCount === 0}
        >
          人物の検索結果へ
        </Button>
      </Box>

      <List sx={{ width: "100%" }}>
        {props.movies.map((movie) => {
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
                onMovieClick={() => {
                  router.push(`movies/${movie.id}}`);
                }}
              />
            </Grid>
          );
        })}
      </List>

      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Pagination
          count={Math.floor(props.movieHitCount / SEARCH_LIMIT) + 1}
          onChange={(e, v) => {
            if (props.page === v) {
              return;
            }
            router.push(
              `/movies?keyword${encodedKeyword}&movieHitCount=${props.movieHitCount}&personHitCount=${props.personHitCount}&page=${targetPage}`
            );
          }}
          page={props.page}
        />
      </Box>
    </Container>
  );
};

export const getServerSideProps = async (ctx) => {
  const { query } = ctx;

  const movieHitCount = string2int(query.movieHitCount)
    ? string2int(query.movieHitCount)
    : await prisma.movie.count({
        where: {
          title: {
            contains: query.keyword,
          },
        },
      });

  const personHitCount = string2int(query.personHitCount)
    ? string2int(query.personHitCount)
    : await prisma.person.count({
        where: {
          name: {
            contains: query.keyword,
          },
        },
      });

  const page = string2int(query.page) ? string2int(query.page) : 1;

  const skip = (page - 1) * SEARCH_LIMIT;

  // とりあえず新しい順に
  const movies = await prisma.movie.findMany({
    where: {
      title: {
        contains: query.keyword,
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
    take: SEARCH_LIMIT,
  });

  return {
    props: forceSerialize({
      keyword: query.keyword,
      movies,
      movieHitCount,
      personHitCount,
      page,
    }),
  };
};

export default MovieSearchResult;
