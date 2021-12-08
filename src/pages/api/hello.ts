// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/lib/prisma";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const data = await prisma.movie.findMany({
    include: {
      genres: true,
    },
  });

  res.status(200).json(JSON.parse(JSON.stringify(data)));
}
