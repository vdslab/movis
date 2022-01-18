import {
  Box,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import { memo, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { FilmarksButton } from "@/components/FilmarksButton";
import { Link } from "@/components/Link";
import { MovieCard } from "@/components/MovieCard";
import { RoundedImage } from "@/components/RoundedImage";
import { BarSection } from "@/components/person/bar";
import { GenreSection } from "@/components/person/genre";
import { NetworkSection } from "@/components/person/network";
import prisma from "@/lib/prisma";
import {
  resetGenre,
  resetNode,
  resetYear,
  selectedNodeSelectors,
  selectSelectedGenreIds,
  selectSelectedYears,
  setRelatedGenre,
  setRelatedYear,
} from "@/modules/features/app/slice";
import {
  fetchTmdbPersonImg,
  filterMovieByGenre,
  filterMovieByNode,
  filterMovieByYear,
  forceSerialize,
  generateFilmarksPersonUrl,
} from "@/util";

const ML = memo(function ML({ filteredMoviesSortedByFilter }) {
  const filterColor = {
    出演者: "error",
    製作年度: "warning",
    ジャンル: "success",
  };

  const filterKeys = ["出演者", "製作年度", "ジャンル"];

  return (
    <Paper
      sx={{
        position: "fixed",
        top: "auto",
        bottom: 0,
        right: 0,
        left: { xs: 0, lg: 300 },
        backgroundColor: "#fafafa",
        zIndex: 99999,
        mx: { lg: 4 },
      }}
    >
      <Box sx={{ m: 0.5 }}>
        <Typography sx={{ mb: 0.5, ml: 0.5 }} variant="subtitle2">
          絞り込まれた映画一覧（左右にスクロールできます）
        </Typography>
        <Box
          sx={{
            height: 188,
            overflowX: "auto",
            whiteSpace: "nowrap",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {filteredMoviesSortedByFilter.map((movie) => {
            const filterResult = movie.filterResult;
            return (
              <Box
                key={movie.id}
                sx={{
                  position: "relative",
                  mx: 0.5,
                  display: "inline-block",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {filterKeys.map((key) => {
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
                <Link href={`/movies/${movie.id}`}>
                  <Box
                    component="img"
                    src={movie.imgUrl}
                    sx={{ width: 130, height: 182 }}
                  />
                </Link>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Paper>
  );
});

const Person = ({
  person,
  relatedMovies,
  relatedGenres,
  occupations,
  // personImgUrl,
}) => {
  const dispatch = useDispatch();
  const [personId, setPersonId] = useState(null);
  const [personImgUrl, setPersonImgUrl] = useState(void 0);

  const selectedNodeIds = useSelector(selectedNodeSelectors.selectIds);
  const selectedGenreIds = useSelector(selectSelectedGenreIds);
  const selectedYears = useSelector(selectSelectedYears);

  const nodeFilteredMovies = useMemo(
    () =>
      filterMovieByNode(
        relatedMovies.map((rm) => rm.movie),
        selectedNodeIds
      ),
    [relatedMovies, selectedNodeIds]
  );

  const genreFilteredMovies = useMemo(
    () =>
      filterMovieByGenre(
        relatedMovies.map((rm) => rm.movie),
        selectedGenreIds
      ),
    [relatedMovies, selectedGenreIds]
  );

  const yearFilteredMovies = useMemo(
    () =>
      filterMovieByYear(
        relatedMovies.map((rm) => rm.movie),
        selectedYears
      ),
    [relatedMovies, selectedYears]
  );

  const nodeFilteredMovieIds = useMemo(
    () => nodeFilteredMovies.map((movie) => movie.id),
    [nodeFilteredMovies]
  );

  const genreFilteredMovieIds = useMemo(
    () => genreFilteredMovies.map((movie) => movie.id),
    [genreFilteredMovies]
  );

  const yearFilteredMovieIds = useMemo(
    () => yearFilteredMovies.map((movie) => movie.id),
    [yearFilteredMovies]
  );

  const movie2filterResultMovie = useMemo(() => {
    const m2f = {};
    relatedMovies.forEach((rm) => {
      const movie = rm.movie;
      const movieId = movie.id;
      const occupation = rm.occupation;
      const occupationName = occupation.name;

      if (movieId in m2f) {
        m2f[movieId] = {
          ...m2f[movieId],
          occupationNames: Array.from(
            new Set([...m2f[movieId].occupationNames, occupationName])
          ),
        };

        return;
      }

      const filterResult = {
        出演者: nodeFilteredMovieIds.includes(movieId),
        ジャンル: genreFilteredMovieIds.includes(movieId),
        製作年度: yearFilteredMovieIds.includes(movieId),
      };

      m2f[movieId] = {
        filterResult,
        id: movieId,
        imgUrl: movie.imgUrl,
        productionYear: movie.productionYear,
        title: movie.title,
        occupationNames: [occupationName],
        genres: movie.genres,
      };
    });

    return m2f;
  }, [
    relatedMovies,
    nodeFilteredMovieIds,
    genreFilteredMovieIds,
    yearFilteredMovieIds,
  ]);

  const moviesSortedByFilter = useMemo(() => {
    return Object.values(movie2filterResultMovie).sort(
      (a, b) =>
        Object.values(b.filterResult).filter((r) => r).length -
        Object.values(a.filterResult).filter((r) => r).length
    );
  }, [movie2filterResultMovie]);

  const filteredMoviesSortedByFilter = useMemo(() => {
    return moviesSortedByFilter.filter(
      (movie) => Object.values(movie.filterResult).filter((r) => r).length > 0
    );
  }, [moviesSortedByFilter]);

  const relatedYears = useMemo(
    () =>
      Array.from(
        new Set(relatedMovies.map((rm) => rm.movie.productionYear))
      ).sort((a, b) => a - b),
    [relatedMovies]
  );

  useEffect(() => {
    (async () => {
      setPersonImgUrl(await fetchTmdbPersonImg(person.name));
    })();
  }, [person.name]);

  // reset
  useEffect(() => {
    dispatch(setRelatedGenre(relatedGenres));
    return () => {
      dispatch(resetGenre());
    };
  }, [dispatch, relatedGenres, person.id]);

  // useEffect(() => {
  //   dispatch(setRelatedYear(years));
  //   return () => {
  //     dispatch(resetYear());
  //   };
  // }, [dispatch, years, person.id]);

  useEffect(() => {
    dispatch(setRelatedYear(relatedYears));
    return () => {
      dispatch(resetYear());
    };
  }, [dispatch, relatedYears, person.id]);

  useEffect(() => {
    return () => {
      dispatch(resetNode());
    };
  }, [dispatch, person.id]);

  // ゴミ処理　ページの初期表示を早くするために
  // id使用はnextの同一pathname間ではstateが初期化されないから、nodeからの遷移時に困るため
  useEffect(() => {
    setTimeout(() => {
      setPersonId(person.id);
    }, 1000);
  }, [person.id]);

  return (
    <Box sx={{ mb: "200px" }}>
      {filteredMoviesSortedByFilter.length > 0 && (
        <ML filteredMoviesSortedByFilter={filteredMoviesSortedByFilter} />
      )}
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
            <Box
              sx={{
                display: "flex",
                justifyContent: { xs: "center", sm: "flex-start" },
                m: 1,
              }}
            >
              <FilmarksButton
                href={generateFilmarksPersonUrl(person.filmarksId)}
              />
            </Box>
            <Box sx={{ my: 1 }}>
              <GenreSection name={person.name} relatedGenres={relatedGenres} />
            </Box>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <BarSection
            relatedMovies={relatedMovies}
            occupations={occupations}
            name={person.name}
          />
        </Grid>

        <Grid item xs={12}>
          {personId === person.id ? (
            <NetworkSection relatedMovies={relatedMovies} name={person.name} />
          ) : (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Typography>ネットワーク描画中</Typography>
              <CircularProgress sx={{ m: 4 }} />
            </Box>
          )}
        </Grid>

        {/* movie list */}
        <Grid item container spacing={2}>
          {moviesSortedByFilter.map((movie) => {
            return (
              <Grid key={movie.id} item xs={12} sm={6} md={4} xl={3}>
                <MovieCard
                  movieId={movie.id}
                  title={movie.title}
                  genres={movie.genres}
                  productionYear={movie.productionYear}
                  imgUrl={movie.imgUrl}
                  filterResult={movie.filterResult}
                  selectedGenreIds={selectedGenreIds}
                  occupationNames={movie.occupationNames}
                />
              </Grid>
            );
          })}
        </Grid>
      </Grid>
    </Box>
  );
};

// export const getServerSideProps = async (ctx) => {
//   const actorOccupationName = "出演者";
//   const pId = ctx.query.personId;

//   const person = await prisma.person.findFirst({
//     where: {
//       id: pId,
//     },
//     select: {
//       id: true,
//       filmarksId: true,
//       name: true,
//     },
//   });

//   const relatedMovies = await prisma.movieOnProductionMember.findMany({
//     where: {
//       personId: pId,
//     },
//     select: {
//       occupation: {
//         select: {
//           name: true,
//         },
//       },
//       movie: {
//         select: {
//           id: true,
//           title: true,
//           imgUrl: true,
//           productionYear: true,
//           genres: true,
//           productionMembers: {
//             select: {
//               person: {
//                 select: {
//                   id: true,
//                   name: true,
//                   relatedMovies: {
//                     where: {
//                       occupation: {
//                         name: {
//                           equals: actorOccupationName,
//                         },
//                       },
//                     },
//                   },
//                 },
//               },
//             },
//             where: {
//               AND: [
//                 {
//                   occupation: {
//                     name: {
//                       equals: actorOccupationName,
//                     },
//                   },
//                 },
//                 {
//                   personId: {
//                     not: pId,
//                   },
//                 },
//               ],
//             },
//             orderBy: {
//               personId: "desc",
//             },
//           },
//         },
//       },
//     },
//   });

//   const relatedMovieIds = relatedMovies.map((rm) => rm.movie.id);

//   relatedMovies.forEach((rm) => {
//     rm.movie.productionMembers.forEach((pm) => {
//       pm.person["relatedMoviesCount"] = pm.person.relatedMovies.length;

//       // ゴミ処理　delete
//       delete pm.person.relatedMovies;
//     });
//   });

//   const relatedGenres = await prisma.genre.findMany({
//     where: {
//       movie: {
//         some: {
//           id: {
//             in: relatedMovieIds,
//           },
//         },
//       },
//     },
//   });

//   const occupations = await prisma.occupation.findMany({
//     select: {
//       name: true,
//     },
//     orderBy: {
//       movies: {
//         _count: "desc",
//       },
//     },
//   });

//   // const personImgUrl = await fetchTmdbPersonImg(person.name);

//   return {
//     props: forceSerialize({
//       person,
//       relatedMovies,
//       relatedGenres,
//       occupations,
//       // personImgUrl,
//     }),
//   };
// };

export const getStaticProps = async (ctx) => {
  const actorOccupationName = "出演者";
  const pId = ctx.params.personId;

  const person = await prisma.person.findFirst({
    where: {
      id: pId,
    },
    select: {
      id: true,
      filmarksId: true,
      name: true,
    },
  });

  const relatedMovies = await prisma.movieOnProductionMember.findMany({
    where: {
      personId: pId,
    },
    select: {
      occupation: {
        select: {
          name: true,
        },
      },
      movie: {
        select: {
          id: true,
          title: true,
          imgUrl: true,
          productionYear: true,
          genres: true,
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
            },
            where: {
              AND: [
                {
                  occupation: {
                    name: {
                      equals: actorOccupationName,
                    },
                  },
                },
                {
                  personId: {
                    not: pId,
                  },
                },
              ],
            },
            orderBy: {
              personId: "desc",
            },
          },
        },
      },
    },
  });

  const relatedMovieIds = relatedMovies.map((rm) => rm.movie.id);

  relatedMovies.forEach((rm) => {
    rm.movie.productionMembers.forEach((pm) => {
      pm.person["relatedMoviesCount"] = pm.person.relatedMovies.length;

      // ゴミ処理　delete
      delete pm.person.relatedMovies;
    });
  });

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

  const personImgUrl = await fetchTmdbPersonImg(person.name);

  return {
    props: forceSerialize({
      person,
      relatedMovies,
      relatedGenres,
      occupations,
      personImgUrl,
    }),
    revalidate: 86400,
  };
};

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export default Person;
