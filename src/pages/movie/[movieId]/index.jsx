import InfoIcon from "@mui/icons-material/Info";
import {
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  ListSubheader,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";

import prisma from "@/lib/prisma";

//TMDB空っ引っ張るのは後回し
const Movie = (props) => {
  const router = useRouter();
  const data = props.data;
  const colorData = {
    ドラマ: "#ff9900",
    恋愛: "#00ff99",
    アクション: "#9900ff",
  };

  const maxGenreData = props.max_genre;

  const personData = data.productionMembers.map((acter, i) => {
    return {
      img: "https://images.unsplash.com/photo-1589118949245-7d38baf380d6",
      title: `${acter.person.name}`,
      author: `${acter.occupation.name}`,
      personId: acter.personId,
    };
  });

  return (
    <Container fixed>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <img width="222px" height="333px" src={props.data.imgUrl} />
        </Grid>
        <Grid item xs={8}>
          <Typography variant="h3" gutterBottom component="div">
            {data.title}
          </Typography>
          <Typography variant="h5" gutterBottom component="div">
            制作年 {data.productionYear}年
          </Typography>
          <Typography variant="h5" gutterBottom component="div">
            制作国
            {data.productionCountries.map((country) => {
              return <div key={country.name}>{country.name}</div>;
            })}
          </Typography>
          <Typography variant="h5" gutterBottom component="div">
            上映時間 {data.runtime}
          </Typography>

          <Card variant="outlined">
            <CardContent>
              <Typography sx={{ fontSize: 14 }}>{data.outline}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <ImageListItem key="Subheader" cols={2}>
        <ListSubheader component="div">出演者</ListSubheader>
      </ImageListItem>
      <ImageList cols={4}>
        {personData.map((item, i) => {
          return (
            <ImageListItem key={item.img + i}>
              <div
                style={{
                  border: `5px solid ${
                    colorData[maxGenreData[i]]
                      ? colorData[maxGenreData[i]]
                      : "#331f00"
                  }`,
                }}
                onClick={() => {
                  router.push(`/person/${item.personId}`);
                }}
              >
                <img
                  src={`${item.img}?w=248&fit=crop&auto=format`}
                  srcSet={`${item.img}?w=248&fit=crop&auto=format&dpr=4 2x`}
                  alt={item.title}
                  loading="lazy"
                />
              </div>
              <ImageListItemBar
                title={`${item.title} ${item.author}`}
                subtitle={
                  <Stack direction="row" spacing={1}>
                    <Chip label={`${maxGenreData[i]}`} color="primary" />
                  </Stack>
                }
                actionIcon={
                  <IconButton
                    sx={{ color: "rgba(255, 255, 255, 0.54)" }}
                    aria-label={`info about ${item.title}`}
                  >
                    <InfoIcon />
                  </IconButton>
                }
              />
            </ImageListItem>
          );
        })}
      </ImageList>
    </Container>
    // <Container>
    //   <Grid container spacing={3}>
    //     <Grid item md={3}>
    //       hello
    //     </Grid>
    //     <Grid item md={9}>
    //       nive
    //     </Grid>
    //   </Grid>
    // </Container>
  );
};
export default Movie;

export const getServerSideProps = async (ctx) => {
  const data = await prisma.movie.findFirst({
    where: {
      id: ctx.query.movieId,
    },
    include: {
      productionMembers: {
        include: {
          person: true,
          occupation: true,
        },
      },
      productionCountries: true,
      genres: true,
    },
  });
  Array.prototype.mode = function () {
    if (this.length === 0) {
      //配列の個数が0だとエラーを返す。
      return null;
    }
    //回数を記録する連想配列
    let counter = {};
    //本来の値を入れた辞書
    let nativeValues = {};

    //最頻値とその出現回数を挿入する変数
    let maxCounter = 0;
    let maxValue = null;

    for (let i = 0; i < this.length; i++) {
      //counterに存在しなければ作る。keyは型を区別する
      if (!counter[this[i] + "_" + typeof this[i]]) {
        counter[this[i] + "_" + typeof this[i]] = 0;
      }
      counter[this[i] + "_" + typeof this[i]]++;
      nativeValues[this[i] + "_" + typeof this[i]] = this[i];
    }
    for (let j = 0; j < Object.keys(counter).length; j++) {
      let key = Object.keys(counter)[j];
      if (counter[key] > maxCounter) {
        maxCounter = counter[key];
        maxValue = nativeValues[key];
      }
    }
    return maxValue;
  };
  const person_genre = await Promise.all(
    data.productionMembers.map(async (person, i) => {
      const person_movie = await prisma.person.findMany({
        where: {
          name: {
            contains: `${person.person.name}`,
          },
        },
        include: {
          relatedMovies: {
            include: {
              movie: {
                include: {
                  genres: true,
                  productionMembers: {
                    include: {
                      person: true,
                      occupation: true,
                    },
                  },
                },
              },
              occupation: true,
            },
            where: {
              occupation: {
                is: {
                  name: "出演者",
                },
              },
            },
          },
        },
      });
      const genre_data = person_movie[0].relatedMovies
        .map((movieData) => {
          return movieData.movie.genres.map((id_name) => id_name.name);
        })
        .flat();
      return genre_data.mode();
    })
  );

  return {
    props: {
      data: JSON.parse(JSON.stringify(data)),
      max_genre: JSON.parse(JSON.stringify(person_genre)),
    },
  };
};
