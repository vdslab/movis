import { SearchOutlined } from "@mui/icons-material";
import {
  Container,
  InputBase,
  IconButton,
  Paper,
  List,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Divider,
  ListItemButton,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";

import Link from "@/components/Link";
import prisma from "@/lib/prisma";
import { forceSerialize } from "@/util/index";

const Search = (props) => {
  const { register, handleSubmit } = useForm({
    defaultValues: { name: props.name },
  });
  const router = useRouter();

  console.log(props);

  return (
    <Container maxWidth="sm" sx={{ pt: 5 }}>
      <Paper
        component="form"
        sx={{
          p: "2px 4px",
          display: "flex",
          alignItems: "center",
          width: "100%",
        }}
        onSubmit={handleSubmit((data) => {
          router.push({
            pathname: "/search/[name]",
            query: { name: data.name },
          });
        })}
      >
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder="人物・映画名で検索"
          {...register("name")}
        />
        <IconButton type="submit" sx={{ p: "10px" }}>
          <SearchOutlined />
        </IconButton>
      </Paper>
      {/* movie list */}
      <Typography component="div" variant="h4">
        映画
      </Typography>
      <List sx={{ width: "100%" }}>
        {props.movies.map((movie, index) => {
          return (
            <Link
              href={{
                pathname: "/movie/[movieId]",
                query: { movieId: movie.id },
              }}
              sx={{ textDecoration: "none", color: "currentcolor" }}
              key={movie.id}
            >
              <ListItemButton alignItems="center">
                <ListItemAvatar>
                  <Avatar
                    variant="square"
                    alt={movie.title}
                    src={movie.imgUrl}
                  />
                </ListItemAvatar>
                <ListItemText primary={movie.title} />
              </ListItemButton>
              {index + 1 < props.movies.length ? (
                <Divider variant="inset" component="li" />
              ) : null}
            </Link>
          );
        })}
      </List>

      {/* person list */}
      <Typography component="div" variant="h4">
        人物
      </Typography>
      <List sx={{ width: "100%" }}>
        {props.people.map((person, index) => {
          return (
            <Link
              href={{
                pathname: "/person/[personId]",
                query: { personId: person.id },
              }}
              sx={{ textDecoration: "none", color: "currentcolor" }}
              key={person.id}
            >
              <ListItemButton alignItems="center">
                <ListItemAvatar>
                  <Avatar
                    variant="square"
                    alt={person.name}
                    src="https://www.tokyoedm.com/wp-content/uploads/2019/10/70322245_2365066260374471_3032238497135067136_n.jpg"
                  />
                </ListItemAvatar>
                <ListItemText primary={person.name} />
              </ListItemButton>
              {index + 1 < props.people.length ? (
                <Divider variant="inset" component="li" />
              ) : null}
            </Link>
          );
        })}
      </List>
    </Container>
  );
};

export const getServerSideProps = async (req, res) => {
  const name = req.query.name;

  const people = await prisma.person.findMany({
    where: {
      name: { contains: name },
    },
    include: {
      relatedMovies: {
        include: {
          occupation: true,
          movie: true,
        },
      },
    },
  });

  const movies = await prisma.movie.findMany({
    where: {
      title: {
        contains: name,
      },
    },
  });

  return {
    props: {
      name: name,
      people: forceSerialize(people),
      movies: forceSerialize(movies),
    },
  };
};

export default Search;
