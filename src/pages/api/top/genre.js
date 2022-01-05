import prisma from "@/lib/prisma";
import { forceSerialize } from "@/util";

export default async function handler(req, res) {
  const { countryId } = req.query;

  // countryIdの国を制作国に含む映画をジャンルごとに取得
  const g = await prisma.genre.findMany({
    select: {
      id: true,
      name: true,
      movie: {
        select: {
          id: true,
        },
        where: {
          productionCountries: {
            some: {
              id: {
                equals: Number(countryId),
              },
            },
          },
        },
      },
    },
    // include: {
    //   movie: {
    //     where: {
    //       productionCountries: {
    //         some: {
    //           id: {
    //             equals: Number(countryId),
    //           },
    //         },
    //       },
    //     },
    //     include: {
    //       productionCountries: true,
    //     },
    //   },
    // },
  });

  g.forEach((item) => {
    item["movieCount"] = item["movie"].length;
    // ゴミ処理　マジのゴミ処理なのでしっかりかこう
    item["movie"] = void 0;
  });

  res.status(200).json(forceSerialize({ g }));
}
