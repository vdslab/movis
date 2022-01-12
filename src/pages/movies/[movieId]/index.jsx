import {
  Box,
  Grid,
  Typography,
  Chip,
  List,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Divider,
} from "@mui/material";
import { useEffect, useState } from "react";

import { Link } from "@/components/Link";
import prisma from "@/lib/prisma";
import { forceSerialize, fetchTmdbPersonImg } from "@/util";

const Movie = ({ movie }) => {
  const [person2imgUrl, setPerson2imgUrl] = useState({});

  // ゴミ処理　複数職業の人をまとめるため
  const listedIds = [];
  const person2occupation = {};
  for (const pm of movie.productionMembers) {
    if (pm.personId in person2occupation) {
      person2occupation[pm.personId].push({ occupation: pm.occupation });
    } else {
      person2occupation[pm.personId] = [{ occupation: pm.occupation }];
    }
  }

  useEffect(() => {
    (async () => {
      const p2i = {};
      for (const pm of movie.productionMembers) {
        p2i[pm.person.id] = await fetchTmdbPersonImg(pm.person.name);
      }
      setPerson2imgUrl(p2i);
    })();
  }, [movie]);

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item container spacing={2}>
          <Grid
            item
            xs={12}
            sm={4}
            sx={{
              display: "flex",
              justifyContent: { xs: "center", sm: "flex-start" },
            }}
          >
            <Box
              component="img"
              src={movie.imgUrl}
              alt={`${movie.title}のポスター`}
              sx={{ height: "300px" }}
            />
            {/* add trailer url */}
            {/* add link to filmarks */}
          </Grid>
          <Grid item xs={12} sm={8}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                // justifyContent: { xs: "center", sm: "flex-start" },
                // alignItems: { xs: "center", sm: "flex-start" },
              }}
            >
              <Typography variant="h4" sx={{ m: 1 }}>
                {movie.title}
              </Typography>
              {movie.originalTitle && (
                <Typography variant="h5" sx={{ m: 1 }}>
                  {movie.originalTitle}
                </Typography>
              )}
              <Box sx={{ display: "flex" }}>
                {movie.runtime && (
                  <Typography sx={{ m: 1 }}>
                    上映時間{movie.runtime}分
                  </Typography>
                )}
                {movie.productionYear && (
                  <Typography sx={{ m: 1 }}>
                    {movie.productionYear}年製作
                  </Typography>
                )}
                {/* ゴミ処理　- と / はどっちが見やすいか確認する */}
                {movie.releaseDate && (
                  <Typography sx={{ m: 1 }}>
                    {
                      movie.releaseDate.slice(0, 10)
                      // .replaceAll("-", "/")
                    }
                    公開
                  </Typography>
                )}
              </Box>
              {movie.productionCountries.length > 0 && (
                <Box>
                  {movie.productionCountries.map((productionCountry) => {
                    return (
                      <Chip
                        label={productionCountry.name}
                        sx={{ m: "2px" }}
                        key={productionCountry.id}
                      />
                    );
                  })}
                </Box>
              )}
              {movie.genres.length > 0 && (
                <Box>
                  {movie.genres.map((genre) => {
                    return (
                      <Chip
                        label={genre.name}
                        clickable={false}
                        sx={{ m: "2px" }}
                        key={genre.id}
                      />
                    );
                  })}
                </Box>
              )}
              {/* ゴミ処理　何かを間違えている。文字列そのままに対しては効いていた */}
              {movie.outline && (
                <Typography sx={{ m: 1, whiteSpace: "pre-wrap" }}>
                  {`${movie.outline.slice(
                    0,
                    Math.floor(movie.outline.length * 0.4)
                  )}`}
                  ...
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
        <Grid
          item
          xs={12}
          sx={{
            display: movie.productionMembers.length === 0 ? "none" : "block",
          }}
        >
          <Typography sx={{ m: 1 }}>製作メンバー</Typography>
          {/* ゴミ処理　sm以上はカードが見栄えが良いかも */}
          <List sx={{ width: "100%" }}>
            {movie.productionMembers
              .sort(
                (a, b) =>
                  person2occupation[b.personId].length -
                  person2occupation[a.personId].length
              )
              .map((pm, index) => {
                if (listedIds.includes(pm.personId)) {
                  return null;
                }

                listedIds.push(pm.personId);

                const { person, occupation } = pm;

                return (
                  <Link
                    href={`/people/${person.id}`}
                    sx={{ textDecoration: "none", color: "currentcolor" }}
                    key={person.id}
                  >
                    <ListItemButton sx={{ justifyContent: "flex-start" }}>
                      <ListItemAvatar>
                        <Avatar
                          variant="square"
                          alt={person.name}
                          src={person2imgUrl[person.id]}
                        />
                      </ListItemAvatar>
                      {/* <ListItemText primary={occupation.name} /> */}
                      <ListItemText
                        primary={person.name}
                        secondary={person2occupation[pm.personId]
                          .map((item) => item.occupation.name)
                          .join("・")}
                      />
                    </ListItemButton>
                    {index + 1 < movie.productionMembers.length ? (
                      <Divider variant="inset" component="li" />
                    ) : null}
                  </Link>
                );
              })}
          </List>
        </Grid>
      </Grid>
    </Box>
  );
};

export const getServerSideProps = async (ctx) => {
  const { query } = ctx;
  const { movieId } = query;
  const movie = await prisma.movie.findFirst({
    where: {
      id: movieId,
    },
    include: {
      genres: true,
      productionCountries: true,
      productionMembers: {
        include: {
          person: true,
          occupation: true,
        },
      },
    },
  });

  for (const pm of movie.productionMembers) {
    pm.person["imgUrl"] = await fetchTmdbPersonImg(pm.person.name);
  }

  return {
    props: forceSerialize({ movie }),
  };
};

export default Movie;
