import {
  Container,
  Typography,
  Grid,
  CardContent,
  Card,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  IconButton,
  ListSubheader,
} from "@mui/material";

// import InfoIcon from '@mui/icons-material/Info';
import prisma from "@/lib/prisma";
//TMDB空っ引っ張るのは後回し
const Movie = (props) => {
  const data = props.data[0];
  console.log(data);
  const personData = data.productionMembers.map((acter, i) => {
    return {
      img: "https://images.unsplash.com/photo-1589118949245-7d38baf380d6",
      title: `${acter.person.name}`,
      author: `${acter.occupation.name}`,
    };
  });
  return (
    <Container fixed>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <img
            width="222px"
            height="333px"
            src={"https://images.unsplash.com/photo-1589118949245-7d38baf380d6"}
          />
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
              return ` ${country.name}`;
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
      <ImageList cols={6}>
        {personData.map((item) => (
          <ImageListItem cellHeight={500} key={item.img}>
            <img
              src={`${item.img}?w=248&fit=crop&auto=format`}
              srcSet={`${item.img}?w=248&fit=crop&auto=format&dpr=4 2x`}
              alt={item.title}
              loading="lazy"
            />
            <ImageListItemBar
              title={item.title}
              subtitle={item.author}
              actionIcon={
                <IconButton
                  sx={{ color: "rgba(255, 255, 255, 0.54)" }}
                  aria-label={`info about ${item.title}`}
                >
                  {/* <InfoIcon /> */}
                </IconButton>
              }
            />
          </ImageListItem>
        ))}
      </ImageList>
    </Container>
  );
};
export default Movie;
export const getServerSideProps = async () => {
  const data = await prisma.movie.findMany({
    where: {
      title: "フォルトゥナの瞳",
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
  return {
    props: {
      data: JSON.parse(JSON.stringify(data)),
    },
  };
};
