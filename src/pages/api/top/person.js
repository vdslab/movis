import prisma from "@/lib/prisma";
import { forceSerialize } from "@/util";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=100");
  const countryId = Number(req.query.countryId);
  const genreId = Number(req.query.genreId);

  const p = await prisma.person.findMany({
    select: {
      id: true,
      name: true,
      relatedMovies: {
        select: {
          movie: {
            select: {
              genres: true,
              productionCountries: true,
            },
          },
        },
        where: {
          movie: {
            AND: [
              {
                productionCountries: {
                  some: {
                    id: {
                      equals: countryId,
                    },
                  },
                },
              },
              {
                genres: {
                  some: {
                    id: {
                      equals: genreId,
                    },
                  },
                },
              },
            ],
          },
          // AND: [
          //   {
          //     movie: {
          //       productionCountries: {
          //         some: {
          //           id: {
          //             equals: countryId,
          //           },
          //         },
          //       },
          //     },
          //   },
          //   {
          //     movie: {
          //       genres: {
          //         some: {
          //           id: {
          //             equals: genreId,
          //           },
          //         },
          //       },
          //     },
          //   },
          // ],
        },
      },
    },
    where: {
      relatedMovies: {
        some: {
          movie: {
            AND: [
              {
                productionCountries: {
                  some: {
                    id: {
                      equals: countryId,
                    },
                  },
                },
              },
              {
                genres: {
                  some: {
                    id: {
                      equals: genreId,
                    },
                  },
                },
              },
            ],
          },
        },
      },
    },

    orderBy: {
      relatedMovies: {
        _count: "desc",
      },
    },
    // take: 5,
  });

  p.forEach((item) => {
    item["movieCount"] = item["relatedMovies"].length;
    delete item.relatedMovies;
  });

  res.status(200).json(
    forceSerialize({
      p: p.sort((a, b) => b.movieCount - a.movieCount).slice(0, 10),
    })
  );
}
