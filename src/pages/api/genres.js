import prisma from "@/lib/prisma";
import { forceSerialize } from "@/util";

export default async function handler(req, res) {
  const data = await prisma.genre.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  res.status(200).json(forceSerialize(data));
}
