import {
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
import { useEffect, useState } from "react";

import { Link } from "@/components/Link";
import { SEARCH_LIMIT } from "@/const";
import prisma from "@/lib/prisma";
import { fetchTmdbPersonImg, forceSerialize, string2int } from "@/util";

const People = ({ keyword, people, movieHitCount, personHitCount, page }) => {
  const [person2imgUrl, setPerson2imgUrl] = useState({});
  const router = useRouter();
  const encodedKeyword = encodeURIComponent(keyword);
  const paginationCount = Number.isInteger(personHitCount / SEARCH_LIMIT)
    ? Math.floor(personHitCount / SEARCH_LIMIT)
    : Math.floor(personHitCount / SEARCH_LIMIT) + 1;

  useEffect(() => {
    (async () => {
      const p2i = {};
      for (const person of people) {
        p2i[person.id] = await fetchTmdbPersonImg(person.name);
      }

      setPerson2imgUrl(p2i);
    })();
  }, [people]);

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { sm: "center" },
        }}
      >
        <Typography sx={{ mb: 2 }}>
          名前に「{keyword}」が含まれる人物
          <Box component="span" sx={{ mx: 1 }}>
            （{personHitCount}件）
          </Box>
        </Typography>
        <Button
          onClick={() => {
            router.push(
              `/movies?keyword=${encodedKeyword}&movieHitCount=${movieHitCount}&personHitCount=${personHitCount}`
            );
          }}
          variant="contained"
          color="primary"
          sx={{ alignSelf: "flex-end" }}
          disabled={movieHitCount === 0}
        >
          映画の検索結果へ
        </Button>
      </Box>
      {/* person list */}
      {people.length > 0 ? (
        <List sx={{ width: "100%" }}>
          {people.map((person, index) => {
            return (
              <Link
                href={`/people/${person.id}`}
                to={`/people/${person.id}`}
                sx={{ textDecoration: "none", color: "currentcolor" }}
                key={person.id}
              >
                <ListItemButton alignItems="center">
                  <ListItemAvatar>
                    <Avatar
                      variant="square"
                      alt={person.name}
                      src={person2imgUrl[person.id]}
                    />
                  </ListItemAvatar>
                  <ListItemText primary={person.name} />
                </ListItemButton>
                {index + 1 < people.length ? (
                  <Divider variant="inset" component="li" />
                ) : null}
              </Link>
            );
          })}
        </List>
      ) : (
        <Box
          sx={{
            height: "30vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography>十分に一致する人物が見つかりません</Typography>
        </Box>
      )}
      {people.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Pagination
            count={paginationCount}
            onChange={(e, targetPage) => {
              if (page === targetPage) {
                return;
              }
              router.push(
                `/people?keyword=${encodedKeyword}&movieHitCount=${movieHitCount}&personHitCount=${personHitCount}&page=${targetPage}`
              );
            }}
            page={page}
          />
        </Box>
      )}
    </Box>
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

// export const getStaticProps = async (ctx) => {
//   const { params } = ctx;

//   const movieHitCount = string2int(params.movieHitCount)
//     ? string2int(params.movieHitCount)
//     : await prisma.movie.count({
//         where: {
//           title: {
//             contains: query.keyword,
//           },
//         },
//       });

//   const personHitCount = string2int(params.personHitCount)
//     ? string2int(params.personHitCount)
//     : await prisma.person.count({
//         where: {
//           name: {
//             contains: params.keyword,
//           },
//         },
//       });

//   const page = string2int(params.page) ? string2int(params.page) : 1;

//   const skip = (page - 1) * SEARCH_LIMIT;

//   // とりあえず関連映画が多い順に
//   const people = await prisma.person.findMany({
//     where: {
//       name: {
//         contains: params.keyword,
//       },
//     },
//     select: {
//       name: true,
//       id: true,
//     },
//     orderBy: {
//       relatedMovies: {
//         _count: "desc",
//       },
//     },
//     skip,
//     take: SEARCH_LIMIT,
//   });

//   return {
//     props: forceSerialize({
//       keyword: params.keyword,
//       people,
//       movieHitCount,
//       personHitCount,
//       page,
//     }),
//     revalidate: 10,
//   };
// };

// export const getStaticPaths = async () => {
//   return {
//     paths: [],
//     fallback: "blocking",
//   };
// };

export default People;
