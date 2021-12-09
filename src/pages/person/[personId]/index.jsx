import { Container, Grid, Typography, Box } from "@mui/material";
import { ResponsiveBar } from "@nivo/bar";
import { useRouter } from "next/router";

import { MovieCard } from "@/components/MovieCard";
import { RoundedImage } from "@/components/RoundedImage";
import { TMDB_IMG_BASE_URL } from "@/const";
import { TMDB_API_KEY } from "@/env";
import prisma from "@/lib/prisma";
import { forceSerialize } from "@/util";

const Person = (props) => {
  console.log(props);
  const router = useRouter();

  return (
    <>
      <Container maxWidth={false} sx={{ my: 2 }}>
        <Grid container spacing={1}>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: "center" }}>
              <RoundedImage
                src={props.data.personImgUrl}
                alt={props.data.person.name + "プロフィール"}
                height="300px"
              />
              <Typography variant="h5">{props.data.person.name}</Typography>
            </Box>
          </Grid>
          <Grid
            item
            xs={12}
            md={9}
            sx={{ display: "flex", alignItems: "center" }}
          >
            <Box
              sx={{ height: 300, width: "100%", textAlign: "center", mt: 3 }}
            >
              <Typography>制作に関わった回数</Typography>
              <ResponsiveBar
                data={props.data.barData}
                keys={props.data.barKeys}
                indexBy="year"
                margin={{ top: 20, right: 90, bottom: 80, left: 20 }}
                padding={0.3}
                valueScale={{ type: "linear" }}
                indexScale={{ type: "band", round: true }}
                colors={{ scheme: "set3" }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 45,
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  format: (e) => Math.floor(e) === e && e,
                }}
                labelSkipWidth={12}
                labelSkipHeight={12}
                labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                legendLabel={(item) => {
                  return item.id.substr(0, 3);
                }}
                legends={[
                  {
                    dataFrom: "keys",
                    anchor: "bottom-right",
                    direction: "column",
                    justify: false,
                    translateX: 120,
                    translateY: 20,
                    itemsSpacing: 2,
                    itemWidth: 100,
                    itemHeight: 20,
                    itemDirection: "left-to-right",
                    itemOpacity: 0.85,
                    symbolSize: 20,
                    effects: [
                      {
                        on: "hover",
                        style: {
                          itemOpacity: 1,
                        },
                      },
                    ],
                  },
                ]}
                role="application"
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={12} sx={{ my: "100px" }}>
            共演者のグラフをここに入れる
          </Grid>

          <Grid item container spacing={1}>
            {props.data.person.relatedMovies.map((rMovie) => {
              const movie = rMovie.movie;
              const handleMovieClick = () => {
                router.push(`/movie/${movie.id}`);
              };
              return (
                <Grid item xs={3} md={4} lg={3} key={movie.id}>
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
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export const getServerSideProps = async (ctx) => {
  console.log(TMDB_API_KEY);
  const personId = ctx.query.personId;
  const person = await prisma.person.findFirst({
    where: {
      id: personId,
    },
    select: {
      relatedMovies: {
        select: {
          occupation: {
            select: {
              name: true,
            },
          },
          movie: {
            select: {
              id: true,
              imgUrl: true,
              title: true,
              genres: true,
              productionYear: true,
            },
          },
        },
      },
      name: true,
    },
  });

  const y = person.relatedMovies.map((item) => {
    return item.movie.productionYear;
  });

  const yearMax = Math.max(...y);
  const yearMin = Math.min(...y);

  const years = [];
  for (let year = yearMin; year <= yearMax; ++year) {
    years.push(year);
  }
  const occupationSet = new Set();
  const yo = {};
  for (const year of years) {
    yo[year] = [];
  }
  for (const relatedMovie of person.relatedMovies) {
    occupationSet.add(relatedMovie.occupation.name);
    yo[relatedMovie.movie.productionYear].push(relatedMovie.occupation.name);
  }
  const relatedOccupations = Array.from(occupationSet);

  const barData = years.map((year) => {
    const d = { year };
    for (const occupation of relatedOccupations) {
      d[occupation] = yo[year].filter((o) => o === occupation).length;
    }
    return d;
  });

  const tmdbRes = await fetch(
    `https://api.themoviedb.org/3/search/person?api_key=${TMDB_API_KEY}&language=ja-JP&query=${encodeURIComponent(
      person.name
    )}&page=1&include_adult=false&region=JP`
  );
  const tmdbSearchResult = await tmdbRes.json();
  const tmdbProfilePath = tmdbSearchResult.results[0]?.profile_path;
  const personImgUrl = tmdbProfilePath
    ? TMDB_IMG_BASE_URL + tmdbProfilePath
    : tmdbProfilePath;

  const occupations = await prisma.occupation.findMany({
    select: {
      name: true,
    },
    orderBy: {
      movies: {
        _count: "desc",
      },
    },
  });
  const barKeys = occupations.map((item) => item.name);

  const data = { person, barData, barKeys, personImgUrl };

  return {
    props: {
      data: forceSerialize(data),
    },
  };
};

export default Person;
