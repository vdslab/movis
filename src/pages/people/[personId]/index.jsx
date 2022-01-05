import { SearchOutlined, ClearOutlined } from "@mui/icons-material";
import {
  Container,
  Grid,
  Typography,
  Box,
  Paper,
  InputBase,
  IconButton,
} from "@mui/material";
import { ResponsiveBar } from "@nivo/bar";
import { memo, useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";

import { ActorNetwork } from "@/components/ActorNetwork";
import { RelatedGenreList } from "@/components/Genre";
import { MovieCard } from "@/components/MovieCard";
import { Responsive } from "@/components/Responsive";
import { RoundedImage } from "@/components/RoundedImage";
import prisma from "@/lib/prisma";
import {
  loadGenres,
  selectPersonRelatedGenres,
  selectSelectedGenres,
  toggleSelectedGenre,
} from "@/modules/features/genres/genresSlice";
import {
  clearSearch,
  loadNetwork,
  selectSelectedNodes,
  setSearch,
} from "@/modules/features/network/networkSlice";
import {
  loadPerson,
  setPersonMovies,
} from "@/modules/features/person/personSlice";
import {
  loadYears,
  selectSelectedYears,
  toggleSelectedYear,
} from "@/modules/features/years/yearsSlice";
import {
  fetchTmdbPersonImg,
  filterMovieByGenre,
  filterMovieByNode,
  filterMovieByYear,
  forceSerialize,
} from "@/util";

const ResponsiveNetwork = memo(function ResponsiveNetwork() {
  return (
    <Responsive
      render={(width, height) => {
        return (
          <Box
            sx={{
              width: width,
              height: height,
            }}
          >
            <ActorNetwork width={width} height={height} />
          </Box>
        );
      }}
    />
  );
});

const GenreSection = memo(function GenreSection({
  name,
  personRelatedGenres,
  handleGenreItemClick,
}) {
  return (
    <Box>
      <Typography sx={{ p: 1 }}>{name}が関わった映画のジャンル</Typography>

      <RelatedGenreList
        personRelatedGenres={personRelatedGenres}
        handleGenreItemClick={handleGenreItemClick}
      />
    </Box>
  );
});

const MovieHistorySection = memo(function MovieHistorySection({
  barData,
  barKeys,
  handleBarClick,
  selectedYears,
}) {
  const years = selectedYears.map((year) => year.year);
  return (
    <Box>
      <Typography sx={{ p: 1 }}>映画製作の記録</Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          height: 280,
          width: "100%",
        }}
      >
        <ResponsiveBar
          data={barData}
          keys={barKeys}
          onClick={(item) => {
            handleBarClick(item.indexValue);
          }}
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
            // ゴミ処理
            renderTick: (tick) => {
              return (
                <g
                  transform={`translate(${tick.x},${
                    tick.y + 20
                  })rotate(45)scale(0.9)`}
                >
                  <text fill={years.includes(tick.value) ? "red" : "black"}>
                    {tick.value}
                  </text>
                  ;
                </g>
              );
            },
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
    </Box>
  );
});

const MovieCardList = memo(function MovieCardList({
  movies,
  nodeFilteredMovieIds,
  yearFilteredMovieIds,
  genreFilteredMovieIds,
  selectedGenreIds,
  handleMovieCardGenreClick,
}) {
  const movieIds = [];
  return (
    <>
      {movies
        .map((movie) => {
          const movieId = movie.id;
          const filterResult = {
            network: nodeFilteredMovieIds.includes(movieId),
            year: yearFilteredMovieIds.includes(movieId),
            genre: genreFilteredMovieIds.includes(movieId),
          };

          return { ...movie, filterResult };
        })
        .sort(
          (a, b) =>
            Object.values(b.filterResult).filter((item) => item).length -
            Object.values(a.filterResult).filter((item) => item).length
        )
        .map((movie) => {
          // ゴミ処理　映画の表示で重複する場合があるので応急処置
          if (movieIds.includes(movie.id)) {
            return null;
          }

          movieIds.push(movie.id);
          return (
            <Grid item xs={12} sm={6} md={4} xl={3} key={movie.id}>
              <MovieCard
                movieId={movie.id}
                title={movie.title}
                genres={movie.genres}
                productionYear={movie.productionYear}
                imgUrl={movie.imgUrl}
                filterResult={movie.filterResult}
                selectedGenreIds={selectedGenreIds}
                handleGenreClick={handleMovieCardGenreClick}
              />
            </Grid>
          );
        })}
    </>
  );
});

const Person = ({
  person,
  barData,
  barKeys,
  personImgUrl,
  network,
  genres,
  years,
}) => {
  const movies = useMemo(
    () =>
      person.relatedMovies.map((rm) => {
        const movie = rm.movie;
        return movie;
      }),
    [person.relatedMovies]
  );

  const { register, handleSubmit, reset } = useForm();

  const dispatch = useDispatch();
  const selectedGenres = useSelector(selectSelectedGenres);
  const personRelatedGenres = useSelector(selectPersonRelatedGenres);
  const selectedNodes = useSelector(selectSelectedNodes.selectAll);
  const selectedYears = useSelector(selectSelectedYears);

  const nodeFilteredMovieIds = useMemo(() => {
    const selectedNodeIds = selectedNodes.map(
      (selectedNode) => selectedNode.id
    );

    return filterMovieByNode(movies, selectedNodeIds);
  }, [movies, selectedNodes]);

  const selectedGenreIds = useMemo(
    () => selectedGenres.map((selectedGenre) => selectedGenre.id),
    [selectedGenres]
  );

  const genreFilteredMovieIds = useMemo(() => {
    const seleectedGenreIds = selectedGenres.map(
      (selectedGenre) => selectedGenre.id
    );

    return filterMovieByGenre(movies, seleectedGenreIds);
  }, [movies, selectedGenres]);

  const yearFilteredMovieIds = useMemo(() => {
    return filterMovieByYear(
      movies,
      selectedYears.map((year) => year.year)
    );
  }, [movies, selectedYears]);

  // ゴミ処理　映画の表示で複数職業担当していると、重複してしまう場合があるので応急処置
  const movieIds = [];

  const handleMovieCardGenreClick = useCallback(
    (genreId) => {
      dispatch(toggleSelectedGenre(genreId));
    },
    [dispatch]
  );

  const handleGenreItemClick = useCallback(
    (genreId) => {
      dispatch(toggleSelectedGenre(genreId));
    },
    [dispatch]
  );

  const handleBarClick = useCallback(
    (year) => {
      dispatch(toggleSelectedYear(year));
    },
    [dispatch]
  );

  useEffect(() => {
    dispatch(loadPerson(person));
  }, [dispatch, person]);

  useEffect(() => {
    dispatch(loadGenres(genres));
  }, [dispatch, genres]);

  useEffect(() => {
    dispatch(setPersonMovies(movies));
  }, [dispatch, movies]);

  useEffect(() => {
    dispatch(loadNetwork(network));
  }, [dispatch, network]);

  useEffect(() => {
    dispatch(loadYears(years));
  }, [dispatch, years]);

  return (
    <Container maxWidth="xl" sx={{ my: 3 }}>
      <Grid container spacing={2}>
        <Grid item container spacing={2}>
          <Grid
            item
            xs={12}
            sm={4}
            sx={{
              display: personImgUrl ? "flex" : "none",
              justifyContent: { xs: "center", sm: "flex-start" },
            }}
          >
            <RoundedImage
              src={personImgUrl}
              alt={person.name + "プロフィール"}
              height="300px"
            />
          </Grid>
          <Grid item xs={12} sm={8}>
            <Box
              sx={{
                display: "flex",
                justifyContent: { xs: "center", sm: "flex-start" },
              }}
            >
              <Typography variant="h4" sx={{ m: 1 }}>
                {person.name}
              </Typography>
            </Box>
            <Box sx={{ my: 2, mx: 1 }}>
              <GenreSection
                name={person.name}
                personRelatedGenres={personRelatedGenres}
                handleGenreItemClick={handleGenreItemClick}
              />
            </Box>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <MovieHistorySection
            barData={barData}
            barKeys={barKeys}
            handleBarClick={handleBarClick}
            selectedYears={selectedYears}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography sx={{ p: 1 }}>
            {person.name}が共演したことのある出演者ネットワーク
          </Typography>
          <Paper
            component="form"
            sx={{
              p: "2px 4px",
              my: 1,
              display: "flex",
              alignItems: "center",
              width: { xs: "100%", sm: "50%" },
            }}
            onSubmit={handleSubmit((formData) => {
              dispatch(setSearch(formData.networkSearch));
            })}
          >
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="ネットワーク内の人物名を検索"
              {...register("networkSearch")}
            />
            <IconButton
              type="button"
              onClick={() => {
                reset({ networkSearch: "" });
                dispatch(clearSearch());
              }}
              sx={{ p: "10px" }}
            >
              <ClearOutlined />
            </IconButton>
            <IconButton type="submit" sx={{ p: "10px" }}>
              <SearchOutlined />
            </IconButton>
          </Paper>
          <Box
            sx={{
              height: "50vh",
              border: "1px solid black",
            }}
          >
            <ResponsiveNetwork />
          </Box>
        </Grid>

        <Grid item container spacing={1}>
          {/* {movies
            .map((movie) => {
              const movieId = movie.id;
              const filterResult = {
                network: nodeFilteredMovieIds.includes(movieId),
                year: yearFilteredMovieIds.includes(movieId),
                genre: genreFilteredMovieIds.includes(movieId),
              };

              return { ...movie, filterResult };
            })
            .sort(
              (a, b) =>
                Object.values(b.filterResult).filter((item) => item).length -
                Object.values(a.filterResult).filter((item) => item).length
            )
            .map((movie) => {
              // ゴミ処理　映画の表示で重複する場合があるので応急処置
              if (movieIds.includes(movie.id)) {
                return null;
              }

              movieIds.push(movie.id);
              return (
                <Grid item xs={12} sm={6} md={4} xl={3} key={movie.id}>
                  <MovieCard
                    movieId={movie.id}
                    title={movie.title}
                    genres={movie.genres}
                    productionYear={movie.productionYear}
                    imgUrl={movie.imgUrl}
                    filterResult={movie.filterResult}
                    selectedGenreIds={selectedGenreIds}
                    handleGenreClick={handleMovieCardGenreClick}
                  />
                </Grid>
              );
            })} */}
          <MovieCardList
            movies={movies}
            nodeFilteredMovieIds={nodeFilteredMovieIds}
            yearFilteredMovieIds={yearFilteredMovieIds}
            genreFilteredMovieIds={genreFilteredMovieIds}
            selectedGenreIds={selectedGenreIds}
            handleMovieCardGenreClick={handleMovieCardGenreClick}
          />
        </Grid>
      </Grid>
    </Container>
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
              // productionMembersは出演者のみ
              productionMembers: {
                select: {
                  person: {
                    select: {
                      id: true,
                      name: true,
                      relatedMovies: {
                        where: {
                          occupation: {
                            name: {
                              equals: actorOccupationName,
                            },
                          },
                        },
                      },
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

  const personImgUrl = await fetchTmdbPersonImg(person.name);

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
  // for (const sourceId in sourceTarget) {
  //   if (sourceId === "countWithMain") {
  //     continue;
  //   }
  //   for (const targetId in sourceTarget[sourceId]) {
  //     if (targetId === "countWithMain") {
  //       continue;
  //     }
  //     links.push({
  //       source: sourceId,
  //       target: targetId,
  //       weight: sourceTarget[sourceId][targetId],
  //       d: 10,
  //     });
  //   }
  // }

  Object.keys(sourceTarget).forEach((sourceId, index) => {
    for (const targetId in sourceTarget[sourceId]) {
      if (targetId !== "countWithMain") {
        links.push({
          source: sourceId,
          target: targetId,
          weight: sourceTarget[sourceId][targetId],
          d: 10,
        });
      }
    }
  });

  const nodeBase = {};
  person.relatedMovies.forEach((rm) => {
    // 出演者として関わった映画のみ共演した出演者を取り出すので
    if (rm.occupation.name !== actorOccupationName) {
      return;
    }
    rm.movie.productionMembers.forEach((pm) => {
      nodeBase[pm.person.id] = {
        ...pm.person,
        id: pm.person.id,
        name: pm.person.name,
        count: sourceTarget[pm.person.id].countWithMain,
        relatedMoviesCount: pm.person.relatedMovies.length,
      };
    });
  });
  const nodes = Object.values(nodeBase);

  const counts = nodes.map((node) => node.count);
  const countMax = Math.max(...counts);
  // const countMin = Math.min(...counts);
  const countMin = 0;

  const relatedMoviesCounts = nodes.map((node) => node.relatedMoviesCount);
  const relatedMoviesCountMax = Math.max(...relatedMoviesCounts);
  const relatedMoviesCountMin = 0;

  for (const node of nodes) {
    const normalizedCount =
      countMax !== countMin
        ? (node.count - countMin) / (countMax - countMin)
        : 0.5;
    const normalizedRelatedMoviesCount =
      relatedMoviesCountMax !== relatedMoviesCountMin
        ? (node.relatedMoviesCount - relatedMoviesCountMin) /
          (relatedMoviesCountMax - relatedMoviesCountMin)
        : 0.5;
    node["normalizedCount"] = normalizedCount;
    node["normalizedRelatedMoviesCount"] = normalizedRelatedMoviesCount;
    // node["r"] = (normalizedCount + 0.1) * 600;
    node["r"] = normalizedCount * 200;

    // ゴミ処理　これ初めてやったので良し悪しがわからん
    delete node.relatedMovies;
  }

  const network = { nodes, links };

  const relatedMovieIds = person.relatedMovies.map((rm) => rm.movie.id);

  const relatedGenres = await prisma.genre.findMany({
    where: {
      movie: {
        some: {
          id: {
            in: relatedMovieIds,
          },
        },
      },
    },
  });
  const relatedGenreIds = relatedGenres.map((rg) => rg.id);

  const allGenres = await prisma.genre.findMany({});
  for (const genre of allGenres) {
    genre["isPersonRelated"] = relatedGenreIds.includes(genre.id);
  }

  return {
    props: forceSerialize({
      person,
      barData,
      barKeys,
      personImgUrl,
      network,
      genres: allGenres,
      years,
    }),
  };
};

export default Person;
