import { Container, Grid, Typography, Box } from "@mui/material";
import { ResponsiveBar } from "@nivo/bar";
import { useRouter } from "next/router";

import { ActorNetwork } from "@/components/ActorNetwork";
import { MovieCard } from "@/components/MovieCard";
import { Responsive } from "@/components/Responsive";
import { RoundedImage } from "@/components/RoundedImage";
import { TMDB_IMG_BASE_URL } from "@/const";
import prisma from "@/lib/prisma";
import { forceSerialize } from "@/util";

const Person = (props) => {
  console.log(props);
  const router = useRouter();

  return (
    <>
      <Container maxWidth={false} sx={{ my: 2 }}>
        <Grid container spacing={1}>
          <Grid
            item
            xs={12}
            md={3}
            xl={2}
            sx={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <RoundedImage
              src={props.data.personImgUrl}
              alt={props.data.person.name + "プロフィール"}
              height="300px"
            />
          </Grid>
          <Grid item xs={12} md={9} xl={10}>
            <Box
              sx={{
                textAlign: { xs: "center", md: "start" },
              }}
            >
              <Typography variant="h4" sx={{ p: 1 }}>
                {props.data.person.name}
              </Typography>
            </Box>
            <Typography sx={{ mt: 3 }}>映画製作の記録</Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                height: 280,
                width: "100%",
              }}
            >
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
                labelTextColor={{
                  from: "color",
                  modifiers: [["darker", 1.6]],
                }}
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
          <Grid
            item
            xs={12}
            md={12}
            sx={{
              height: "50vh",
            }}
          >
            <Responsive
              render={(width, height) => {
                return (
                  <Box
                    sx={{
                      width: width,
                      height: height,
                      border: "1px solid black",
                    }}
                  >
                    <ActorNetwork width={width} height={height} {...props} />
                  </Box>
                );
              }}
            />
          </Grid>

          <Grid item container spacing={1}>
            {props.data.person.relatedMovies.map((rMovie) => {
              const movie = rMovie.movie;
              const handleMovieClick = () => {
                router.push(`/movie/${movie.id}`);
              };
              return (
                <Grid item xs={12} sm={6} md={4} xl={3} key={movie.id}>
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
  const actorOccupationName = "出演者";

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
              // ここから
              productionMembers: {
                select: {
                  person: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                  occupation: {
                    select: {
                      name: true,
                      id: true,
                    },
                  },
                },
                where: {
                  AND: [
                    {
                      occupation: {
                        is: {
                          name: actorOccupationName,
                        },
                      },
                    },
                    {
                      personId: {
                        not: personId,
                      },
                    },
                  ],
                },
                orderBy: {
                  personId: "desc",
                },
              },
              // ここまでは返す必要のない大きなデータなので、返すためのpersonとは別で取るか、返す前に消すかした方がいいかもしれない
            },
          },
        },
      },
      name: true,
    },
  });

  // ここからbar
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

  // ここからnetwork
  const sourceTarget = {};
  person.relatedMovies.forEach((rm) => {
    // 出演者として関わった映画のみ共演した出演者を取り出すので
    if (rm.occupation.name !== actorOccupationName) {
      return;
    }
    rm.movie.productionMembers.forEach((spm, index) => {
      const sourceId = spm.person.id;
      if (sourceId in sourceTarget === false) {
        // countWithMainは中心となる俳優との共演回数
        sourceTarget[sourceId] = { countWithMain: 0 };
      }
      ++sourceTarget[sourceId].countWithMain;

      rm.movie.productionMembers.slice(index + 1).forEach((tpm) => {
        const targetId = tpm.person.id;
        // この値は俳優同士の共演回数
        sourceTarget[sourceId][targetId] =
          (sourceTarget[sourceId][targetId] || 0) + 1;
      });
    });
  });

  const links = [];
  for (const sourceId in sourceTarget) {
    if (sourceId === "countWithMain") {
      continue;
    }
    for (const targetId in sourceTarget[sourceId]) {
      if (targetId === "countWithMain") {
        continue;
      }
      links.push({
        source: sourceId,
        target: targetId,
        weight: sourceTarget[sourceId][targetId],
        d: 10,
      });
    }
  }

  const nodeBase = {};
  person.relatedMovies.forEach((rm) => {
    rm.movie.productionMembers.forEach((pm) => {
      nodeBase[pm.person.id] = {
        ...pm.person,
        count: sourceTarget[pm.person.id].countWithMain,
      };
    });
  });
  const nodes = Object.values(nodeBase);

  const counts = nodes.map((node) => node.count);
  const countMax = Math.max(...counts);
  const countMin = Math.min(...counts);

  for (const node of nodes) {
    const normalizedCount =
      countMax !== countMin
        ? (node.count - countMin) / (countMax - countMin)
        : 0.5;
    node["normalizedCount"] = normalizedCount;
    node["r"] = (normalizedCount + 0.1) * 20;
  }

  const network = { nodes, links };

  const data = { person, barData, barKeys, personImgUrl, network };

  return {
    props: {
      data: forceSerialize(data),
    },
  };
};

export default Person;
