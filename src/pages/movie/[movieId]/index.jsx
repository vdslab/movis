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

// import InfoIcon from "@mui/icons-material/Info";
// import {
//   Card,
//   CardContent,
//   Chip,
//   Container,
//   Grid,
//   IconButton,
//   ImageList,
//   ImageListItem,
//   ImageListItemBar,
//   ListSubheader,
//   Stack,
//   Typography,
// } from "@mui/material";
// import { useRouter } from "next/router";

// import prisma from "@/lib/prisma";

// //TMDB空っ引っ張るのは後回し
// const Movie = (props) => {
//   const router = useRouter();
//   const data = props.data;
//   const colorData = {
//     ドラマ: "#ff9900",
//     恋愛: "#00ff99",
//     アクション: "#9900ff",
//   };

//   const maxGenreData = props.max_genre;

//   const personData = data.productionMembers.map((acter, i) => {
//     return {
//       img: "https://images.unsplash.com/photo-1589118949245-7d38baf380d6",
//       title: `${acter.person.name}`,
//       author: `${acter.occupation.name}`,
//       personId: acter.personId,
//     };
//   });

//   return (
//     <Container fixed>
//       <Grid container spacing={2}>
//         <Grid item xs={4}>
//           <img width="222px" height="333px" src={props.data.imgUrl} />
//         </Grid>
//         <Grid item xs={8}>
//           <Typography variant="h3" gutterBottom component="div">
//             {data.title}
//           </Typography>
//           <Typography variant="h5" gutterBottom component="div">
//             制作年 {data.productionYear}年
//           </Typography>
//           <Typography variant="h5" gutterBottom component="div">
//             制作国
//             {data.productionCountries.map((country) => {
//               return <div key={country.name}>{country.name}</div>;
//             })}
//           </Typography>
//           <Typography variant="h5" gutterBottom component="div">
//             上映時間 {data.runtime}
//           </Typography>

//           <Card variant="outlined">
//             <CardContent>
//               <Typography sx={{ fontSize: 14 }}>{data.outline}</Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>

//       <ImageListItem key="Subheader" cols={2}>
//         <ListSubheader component="div">出演者</ListSubheader>
//       </ImageListItem>
//       <ImageList cols={4}>
//         {personData.map((item, i) => {
//           return (
//             <ImageListItem key={item.img + i}>
//               <div
//                 style={{
//                   border: `5px solid ${
//                     colorData[maxGenreData[i]]
//                       ? colorData[maxGenreData[i]]
//                       : "#331f00"
//                   }`,
//                 }}
//                 onClick={() => {
//                   router.push(`/person/${item.personId}`);
//                 }}
//               >
//                 <img
//                   src={`${item.img}?w=248&fit=crop&auto=format`}
//                   srcSet={`${item.img}?w=248&fit=crop&auto=format&dpr=4 2x`}
//                   alt={item.title}
//                   loading="lazy"
//                 />
//               </div>
//               <ImageListItemBar
//                 title={`${item.title} ${item.author}`}
//                 subtitle={
//                   <Stack direction="row" spacing={1}>
//                     <Chip label={`${maxGenreData[i]}`} color="primary" />
//                   </Stack>
//                 }
//                 actionIcon={
//                   <IconButton
//                     sx={{ color: "rgba(255, 255, 255, 0.54)" }}
//                     aria-label={`info about ${item.title}`}
//                   >
//                     <InfoIcon />
//                   </IconButton>
//                 }
//               />
//             </ImageListItem>
//           );
//         })}
//       </ImageList>
//     </Container>
//     // <Container>
//     //   <Grid container spacing={3}>
//     //     <Grid item md={3}>
//     //       hello
//     //     </Grid>
//     //     <Grid item md={9}>
//     //       nive
//     //     </Grid>
//     //   </Grid>
//     // </Container>
//   );
// };
// export default Movie;

// export const getServerSideProps = async (ctx) => {
//   const data = await prisma.movie.findFirst({
//     where: {
//       id: ctx.query.movieId,
//     },
//     include: {
//       productionMembers: {
//         include: {
//           person: true,
//           occupation: true,
//         },
//       },
//       productionCountries: true,
//       genres: true,
//     },
//   });
//   Array.prototype.mode = function () {
//     if (this.length === 0) {
//       //配列の個数が0だとエラーを返す。
//       return null;
//     }
//     //回数を記録する連想配列
//     let counter = {};
//     //本来の値を入れた辞書
//     let nativeValues = {};

//     //最頻値とその出現回数を挿入する変数
//     let maxCounter = 0;
//     let maxValue = null;

//     for (let i = 0; i < this.length; i++) {
//       //counterに存在しなければ作る。keyは型を区別する
//       if (!counter[this[i] + "_" + typeof this[i]]) {
//         counter[this[i] + "_" + typeof this[i]] = 0;
//       }
//       counter[this[i] + "_" + typeof this[i]]++;
//       nativeValues[this[i] + "_" + typeof this[i]] = this[i];
//     }
//     for (let j = 0; j < Object.keys(counter).length; j++) {
//       let key = Object.keys(counter)[j];
//       if (counter[key] > maxCounter) {
//         maxCounter = counter[key];
//         maxValue = nativeValues[key];
//       }
//     }
//     return maxValue;
//   };
//   const person_genre = await Promise.all(
//     data.productionMembers.map(async (person, i) => {
//       const person_movie = await prisma.person.findMany({
//         where: {
//           name: {
//             contains: `${person.person.name}`,
//           },
//         },
//         include: {
//           relatedMovies: {
//             include: {
//               movie: {
//                 include: {
//                   genres: true,
//                   productionMembers: {
//                     include: {
//                       person: true,
//                       occupation: true,
//                     },
//                   },
//                 },
//               },
//               occupation: true,
//             },
//             where: {
//               occupation: {
//                 is: {
//                   name: "出演者",
//                 },
//               },
//             },
//           },
//         },
//       });
//       const genre_data = person_movie[0].relatedMovies
//         .map((movieData) => {
//           return movieData.movie.genres.map((id_name) => id_name.name);
//         })
//         .flat();
//       return genre_data.mode();
//     })
//   );

//   return {
//     props: {
//       data: JSON.parse(JSON.stringify(data)),
//       max_genre: JSON.parse(JSON.stringify(person_genre)),
//     },
//   };
// };
