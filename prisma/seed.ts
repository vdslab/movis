import { PrismaClient } from "@prisma/client";

import filmarksData from "./data/filmarks_20211109.json";

const prisma = new PrismaClient();

interface Person {
  id: string;
  name: string;
}

interface Movie {
  id: string;
  title: string;
  original_title: string | null;
  img_url: string | null;
  release_date: string | null;
  production_year: string;
  production_countries: string[];
  runtime: string | null;
  rating_score: string;
  genres: string[];
  outline: string | null;
  production_members: { [key: string]: Person[] };
  actors: Person[];
  trailer_url: string | null;
}

interface Data {
  movies: Movie[];
  occupations: string[];
  genres: string[];
  countries: string[];
}

const main = async () => {
  const data: Data = filmarksData as any;
  const ActorOccupationName: string = "出演者";
  data.occupations.push(ActorOccupationName);

  const id2uuidMap: { [key: string]: string } = {};

  for (const movies of data.movies) {
    movies.production_members[ActorOccupationName] = movies.actors;
  }

  for (const movie of data.movies) {
    for (const occupation in movie.production_members) {
      for (const person of movie.production_members[occupation]) {
        if (!(person.id in id2uuidMap)) {
          const p = await prisma.person.create({
            data: {
              name: person.name,
              // filmarksId: Number(person.id),
            },
          });
          id2uuidMap[person.id] = p.id;
          console.log(`person created with id: ${p.id}`);
        }
      }
    }
  }

  for (const occupation of data.occupations) {
    const o = await prisma.occupation.create({
      data: {
        name: occupation,
      },
    });
    console.log(`occupation created with id: ${o.id}`);
  }

  for (const genre of data.genres) {
    const g = await prisma.genre.create({
      data: {
        name: genre,
      },
    });
    console.log(`genre created with id: ${g.id}`);
  }

  console.log(data.countries);
  for (const country of data.countries) {
    const c = await prisma.country.create({
      data: {
        name: country,
      },
    });
    console.log(`country created with id: ${c.id}`);
  }

  for (const movie of data.movies) {
    const productionYear = Number(movie.production_year);
    const runtime =
      movie.runtime === null
        ? movie.runtime
        : Number(movie.runtime.replace("分", ""));
    const releaseDate = movie.release_date
      ? new Date(
          movie.release_date
            .replace("年", "-")
            .replace("月", "-")
            .replace("日", "")
        )
      : movie.release_date;

    const people = [];
    for (const occupation in movie.production_members) {
      for (const person of movie.production_members[occupation]) {
        people.push({ ...person, occupation });
      }
    }

    const m = await prisma.movie.create({
      data: {
        // filmarksId: Number(movie.id),
        title: movie.title,
        originalTitle: movie.original_title,
        imgUrl: movie.img_url,
        releaseDate,
        productionYear,
        runtime,
        outline: movie.outline,
        trailerUrl: movie.trailer_url,
        genres: {
          connect: movie.genres.map((genre) => ({ name: genre })),
        },
        productionCountries: {
          connect: movie.production_countries.map((country) => ({
            name: country,
          })),
        },
        productionMembers: {
          create: people.map((person) => ({
            person: { connect: { id: id2uuidMap[person.id] } },
            occupation: { connect: { name: person.occupation } },
          })),
        },
      },
    });
    console.log(`movie created with id: ${m.id}`);
  }
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
