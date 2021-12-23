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
import { SEARCH_LIMIT } from "@/const";
import prisma from "@/lib/prisma";
import { fetchTmdbPersonImg, forceSerialize, string2int } from "@/util";

const People = (props) => {
  console.log(props);
  const router = useRouter();
  const encodedKeyword = encodeURIComponent(props.keyword);

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
          名前に「{props.keyword}」が含まれる人物
          <Box component="span" sx={{ mx: 1 }}>
            （{props.personHitCount}件）
          </Box>
        </Typography>
        <Button
          onClick={() => {
            router.push(
              `/movies?keyword=${encodedKeyword}&movieHitCount=${props.movieHitCount}&personHitCount=${props.personHitCount}`
            );
          }}
          variant="contained"
          color="primary"
          sx={{ alignSelf: "flex-end" }}
          disabled={props.movieHitCount === 0}
        >
          映画の検索結果へ
        </Button>
      </Box>
      {/* person list */}
      <List sx={{ width: "100%" }}>
        {props.people.map((person, index) => {
          return (
            <Link
              href={`/people/${person.id}`}
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
          count={Math.floor(props.personHitCount / SEARCH_LIMIT) + 1}
          onChange={(e, targetPage) => {
            if (props.page === targetPage) {
              return;
            }
            router.push(
              `/people?keyword=${encodedKeyword}&movieHitCount=${props.movieHitCount}&personHitCount=${props.personHitCount}&page=${targetPage}`
            );
          }}
          page={props.page}
        />
      </Box>
    </Container>
  );
};

export const getServerSideProps = async (ctx) => {
  const { query } = ctx;

  const movieHitCount = string2int(query.movieHitCount)
    ? string2int(query.movieHitCount)
    : await prisma.movie.count({
        where: {
          title: {
            contains: query.keyword,
          },
        },
      });

  const personHitCount = string2int(query.personHitCount)
    ? string2int(query.personHitCount)
    : await prisma.person.count({
        where: {
          name: {
            contains: query.keyword,
          },
        },
      });

  const page = string2int(query.page) ? string2int(query.page) : 1;

  const skip = (page - 1) * SEARCH_LIMIT;

  // とりあえず関連映画が多い順に
  const people = await prisma.person.findMany({
    where: {
      name: {
        contains: query.keyword,
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
    take: SEARCH_LIMIT,
  });

  for (const person of people) {
    person["imgUrl"] = await fetchTmdbPersonImg(person.name);
  }

  return {
    props: forceSerialize({
      keyword: query.keyword,
      people,
      movieHitCount,
      personHitCount,
      page,
    }),
  };
};

export default People;
