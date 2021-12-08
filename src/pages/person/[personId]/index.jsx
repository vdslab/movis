import { Chip, Container, Grid, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { ResponsiveBar } from "@nivo/bar";
import { useRouter } from "next/router";

import { TMDB_IMG_BASE_URL } from "@/const";
import { TMDB_API_KEY } from "@/env";
import prisma from "@/lib/prisma";
import { forceSerialize } from "@/util";

const MovieCard = ({ movieId, title, genres, productionYear, imgUrl }) => {
  return (
    <Grid container spacing={0.5} py={1}>
      <Grid item xs={12} md={4}>
        {/* filmarksで画像がない場合はnullか以下のどちらか
          代替画像　"https://d2ueuvlup6lbue.cloudfront.net/assets/common/img_cover-placehold-633a19fbbf6951dbb8debea06f29fefcc0666e8138e79c5ffd8a486da95432ae.svg"
          Access Denied "https://d2ueuvlup6lbue.cloudfront.net/attachments/3746e77fb0935f2689e4ddfb009544a5d3008fae/store/fitpad/260/364/c793bf8000d9666861c3221dfea00c7b1449a522553e634378a6c7238aa3/_.jpg" */}
        {imgUrl && <img alt={`${title}のポスター`} width="100%" src={imgUrl} />}
      </Grid>
      <Grid item md={8} sx={{ display: { xs: "none", md: "block" } }}>
        <Typography>{title}</Typography>
        <Typography>{productionYear}</Typography>
        {genres.map((genre) => {
          return <Chip label={genre.name} key={genre.id} />;
        })}
      </Grid>
    </Grid>
  );
};

const Person = (props) => {
  console.log(props);
  const router = useRouter();

  return (
    <Container maxWidth="lg">
      <Grid container spacing={1} justifyContent="center" alignItems="center">
        <Grid item xs={3} md={3}>
          <img
            width="100%"
            src={props.data.personImgUrl}
            alt={props.data.person.name + "プロフィール"}
          />
        </Grid>
        <Grid item xs={9} md={9}>
          <Typography>{props.data.person.name}</Typography>
          <Box sx={{ height: 300, width: "100%" }}>
            <ResponsiveBar
              data={props.data.barData}
              keys={props.data.occupations}
              indexBy="year"
              margin={{ top: 20, right: 90, bottom: 80, left: 60 }}
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
                legend: "year",
                legendPosition: "middle",
                legendOffset: 50,
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: "count",
                legendPosition: "middle",
                legendOffset: -40,
                format: (e) => Math.floor(e) === e && e,
              }}
              labelSkipWidth={12}
              labelSkipHeight={12}
              labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
              legends={[
                {
                  dataFrom: "keys",
                  anchor: "bottom-right",
                  direction: "column",
                  justify: false,
                  translateX: 120,
                  translateY: 0,
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
              ariaLabel="Nivo bar chart demo"
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={12}>
          共演者のグラフをここに入れる
        </Grid>

        <Grid item container>
          {props.data.person.relatedMovies.map((rMovie) => {
            const movie = rMovie.movie;
            return (
              <Grid item xs={3} md={4} key={movie.id} alignItems="flex-end">
                <Box
                  component="div"
                  onClick={() => {
                    router.push(`/movie/${movie.id}`);
                  }}
                >
                  <MovieCard
                    movieId={movie.id}
                    title={movie.title}
                    genres={movie.genres}
                    productionYear={movie.productionYear}
                    imgUrl={movie.imgUrl}
                  />
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Grid>
    </Container>
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
  const occupations = Array.from(occupationSet);

  const barData = years.map((year) => {
    const d = { year };
    for (const occupation of occupations) {
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

  const data = { person, barData, occupations, personImgUrl };

  return {
    props: {
      data: forceSerialize(data),
    },
  };
};

export default Person;
