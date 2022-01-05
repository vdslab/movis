import prisma from "@/lib/prisma";
import { forceSerialize } from "@/util";

export default async function handler(req, res) {
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
          AND: [
            {
              movie: {
                productionCountries: {
                  some: {
                    id: {
                      equals: countryId,
                    },
                  },
                },
              },
            },
            {
              movie: {
                genres: {
                  some: {
                    id: {
                      equals: genreId,
                    },
                  },
                },
              },
            },
          ],
        },
      },
    },

    // where: {
    //   AND: [
    //     {
    //       relatedMovies: {
    //         some: {
    //           movie: {
    //             productionCountries: {
    //               some: {
    //                 id: {
    //                   equals: countryId,
    //                 },
    //               },
    //             },
    //           },
    //         },
    //       },
    //     },
    //     {
    //       relatedMovies: {
    //         some: {
    //           movie: {
    //             genres: {
    //               some: {
    //                 id: {
    //                   equals: genreId,
    //                 },
    //               },
    //             },
    //           },
    //         },
    //       },
    //     },
    //   ],
    // },
    orderBy: {
      relatedMovies: {
        _count: "desc",
      },
    },
    take: 5,
  });

  res.status(200).json(forceSerialize({ p }));
}
