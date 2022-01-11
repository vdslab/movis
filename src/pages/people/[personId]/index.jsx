import { Box, Container, Grid, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

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
  toggleSelectedGenre,
  toggleSelectedNode,
  toggleSelectedYear,
} from "@/modules/features/app-new/slice";
import {
  fetchTmdbPersonImg,
  filterMovieByGenre,
  filterMovieByNode,
  filterMovieByYear,
  forceSerialize,
  generateBarData,
  generateNetworkData,
} from "@/util";

const Person = ({
  person,
  relatedMovies,
  relatedGenres,
  occupations,
  personImgUrl,
}) => {
  const dispatch = useDispatch();

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

  const years = useMemo(() => {
    const relatedYears = relatedMovies.map((rm) => rm.movie.productionYear);

    const yearMax = Math.max(...relatedYears);
    const yearMin = Math.min(...relatedYears);

    const filledYears = [];
    for (let y = yearMin; y <= yearMax; ++y) {
      filledYears.push(y);
    }

    return filledYears;
  }, [relatedMovies]);

  const initialNetwork = useMemo(
    () => generateNetworkData(relatedMovies),
    [relatedMovies]
  );

  const barData = useMemo(
    () => generateBarData(relatedMovies, occupations, years),
    [relatedMovies, occupations, years]
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

  const handleNodeClick = useCallback(
    (node) => {
      dispatch(toggleSelectedNode(node));
    },
    [dispatch]
  );

  // reset
  useEffect(() => {
    dispatch(setRelatedGenre(relatedGenres));
    return () => {
      dispatch(resetGenre());
    };
  }, [dispatch, relatedGenres, person.id]);

  useEffect(() => {
    dispatch(setRelatedYear(years));
    return () => {
      dispatch(resetYear());
    };
  }, [dispatch, years, person.id]);

  useEffect(() => {
    return () => {
      dispatch(resetNode());
    };
  }, [dispatch, person.id]);

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
                relatedGenres={relatedGenres}
                handleGenreItemClick={handleGenreItemClick}
                selectedGenreIds={selectedGenreIds}
              />
            </Box>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <BarSection
            barData={barData}
            handleBarClick={handleBarClick}
            selectedYears={selectedYears}
          />
        </Grid>

        <Grid item xs={12}>
          <NetworkSection
            name={person.name}
            handleNodeClick={handleNodeClick}
            initialNetwork={initialNetwork}
            relatedMovies={relatedMovies}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export const getServerSideProps = async (ctx) => {
  const actorOccupationName = "出演者";
  const pId = ctx.query.personId;

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
  };
};

export default Person;
