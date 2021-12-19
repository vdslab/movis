import {
  Container,
  List,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Divider,
  ListItemButton,
  Typography,
  Pagination,
  Box,
  Button,
} from "@mui/material";
import { useRouter } from "next/router";

import { Link } from "@/components/Link";
import prisma from "@/lib/prisma";
import { fetchTmdbPersonImg, forceSerialize } from "@/util";

const TAKE = 10;

const PersonSearchResult = (props) => {
  console.log(props);

  const router = useRouter();
  const encodedName = encodeURIComponent(props.name);

  return (
    <Container maxWidth="xl" sx={{ my: 3 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { sm: "center" },
        }}
      >
        <Typography sx={{ mb: 2 }}>
          名前に「{props.name}」が含まれる人物
        </Typography>
        <Button
          onClick={() => {
            router.push(
              `/search/${encodedName}/person?movieHitCount=${props.movieHitCount}&personHitCount=${props.personHitCount}`
            );
          }}
          variant="contained"
          color="primary"
          sx={{ alignSelf: "flex-end" }}
        >
          人物の検索結果へ
        </Button>
      </Box>
      {/* person list */}
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
                    src={person.imgUrl}
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
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Pagination
          count={Math.floor(props.personHitCount / TAKE) + 1}
          onChange={(e, v) => {
            router.push(
              `/search/${encodedName}/person?movieHitCount=${props.movieHitCount}&personHitCount=${props.personHitCount}&page=${v}`
            );
          }}
          defaultPage={Number.isInteger(props.page) ? props.page : 1}
        />
      </Box>
    </Container>
  );
};

export const getServerSideProps = async (ctx) => {
  const { query } = ctx;
  const { name, movieHitCount, personHitCount, page } = query;

  const skip = Number.isInteger(Number(page))
    ? (Number(page) - 1 < 0 ? 0 : Number(page) - 1) * TAKE
    : 0;

  // とりあえず関連映画が多い順に
  const people = await prisma.person.findMany({
    where: {
      name: {
        contains: name,
      },
    },
    select: {
      name: true,
      id: true,
    },
    orderBy: {
      relatedMovies: {
        _count: "desc",
      },
    },
    skip,
    take: TAKE,
  });

  for (const person of people) {
    person["imgUrl"] = await fetchTmdbPersonImg(person.name);
  }

  return {
    props: forceSerialize({
      name,
      movieHitCount,
      personHitCount,
      people,
      page,
    }),
  };
};

export default PersonSearchResult;
