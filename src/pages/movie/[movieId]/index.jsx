import {
  Box,
  Container,
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

import { Link } from "@/components/Link";
import prisma from "@/lib/prisma";
import { forceSerialize, fetchTmdbPersonImg } from "@/util";

const Movie = (props) => {
  console.log(props);
  // ゴミ処理　複数職業の人をまとめるため
  const listedIds = [];
  const person2occupation = {};
  for (const pm of props.movie.productionMembers) {
    if (pm.personId in person2occupation) {
      person2occupation[pm.personId].push({ occupation: pm.occupation });
    } else {
      person2occupation[pm.personId] = [{ occupation: pm.occupation }];
    }
  }
  console.log(person2occupation);

  return (
    <Container maxWidth="xl" sx={{ my: 3 }}>
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
              src={props.movie.imgUrl}
              alt={`${props.movie.title}のポスター`}
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
                {props.movie.title}
              </Typography>
              {props.movie.originalTitle && (
                <Typography variant="h5" sx={{ m: 1 }}>
                  {props.movie.originalTitle}
                </Typography>
              )}
              <Box sx={{ display: "flex" }}>
                {props.movie.runtime && (
                  <Typography sx={{ m: 1 }}>
                    上映時間{props.movie.runtime}分
                  </Typography>
                )}
                {props.movie.productionYear && (
                  <Typography sx={{ m: 1 }}>
                    {props.movie.productionYear}年製作
                  </Typography>
                )}
                {/* ゴミ処理　- と / はどっちが見やすいか確認する */}
                {props.movie.releaseDate && (
                  <Typography sx={{ m: 1 }}>
                    {
                      props.movie.releaseDate.slice(0, 10)
                      // .replaceAll("-", "/")
                    }
                    公開
                  </Typography>
                )}
              </Box>
              {props.movie.productionCountries.length > 0 && (
                <Box>
                  {props.movie.productionCountries.map((productionCountry) => {
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
              {props.movie.genres.length > 0 && (
                <Box>
                  {props.movie.genres.map((genre) => {
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
              {props.movie.outline && (
                <Typography sx={{ m: 1, whiteSpace: "pre-wrap" }}>
                  {`${props.movie.outline.slice(
                    0,
                    Math.floor(props.movie.outline.length * 0.4)
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
            display:
              props.movie.productionMembers.length === 0 ? "none" : "block",
          }}
        >
          <Typography>製作メンバー</Typography>
          {/* ゴミ処理　sm以上はカードが見栄えが良いかも */}
          <List sx={{ width: "100%" }}>
            {props.movie.productionMembers
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
                    href={`/person/${person.id}`}
                    sx={{ textDecoration: "none", color: "currentcolor" }}
                    key={person.id}
                  >
                    <ListItemButton sx={{ justifyContent: "flex-start" }}>
                      <ListItemAvatar>
                        <Avatar
                          variant="square"
                          alt={person.name}
                          src={person.imgUrl}
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
                    {index + 1 < props.movie.productionMembers.length ? (
                      <Divider variant="inset" component="li" />
                    ) : null}
                  </Link>
                );
              })}
          </List>
        </Grid>
      </Grid>
    </Container>
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
