import { Container, Box, Typography } from "@mui/material";
// import { ResponsiveBar } from "@nivo/bar";

import prisma from "@/lib/prisma";
import { forceSerialize } from "@/util";

const Bar = (props) => {
  const years = [];
  for (let year = 2000; year <= 2025; ++year) {
    years.push(year);
  }

  return (
    <Container sx={{ pt: 5 }}>
      {props.people.map((person) => {
        const occupationSet = new Set();
        const yo = {};
        for (const year of years) {
          yo[year] = [];
        }
        for (const relatedMovie of person.relatedMovies) {
          occupationSet.add(relatedMovie.occupation.name);
          yo[relatedMovie.movie.productionYear].push(
            relatedMovie.occupation.name
          );
        }
        const occupations = Array.from(occupationSet);

        const data = years.map((year) => {
          const d = { year };
          for (const occupation of occupations) {
            d[occupation] = yo[year].filter((o) => o === occupation).length;
          }
          return d;
        });

        return (
          <Box sx={{ mt: 10, height: 300, width: "100%" }} key={person.id}>
            {/* <ResponsiveBar
              data={data}
              keys={occupations}
              indexBy="year"
              margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
              padding={0.3}
              valueScale={{ type: "linear" }}
              indexScale={{ type: "band", round: true }}
              colors={{ scheme: "set3" }}
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: "year",
                legendPosition: "middle",
                legendOffset: 32,
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: "count",
                legendPosition: "middle",
                legendOffset: -40,
                format: (e) => Math.floor(e) === e && e,
              }}
              labelSkipWidth={12}
              labelSkipHeight={12}
              labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
              legends={[
                {
                  dataFrom: "keys",
                  anchor: "bottom-right",
                  direction: "column",
                  justify: false,
                  translateX: 120,
                  translateY: 0,
                  itemsSpacing: 2,
                  itemWidth: 100,
                  itemHeight: 20,
                  itemDirection: "left-to-right",
                  itemOpacity: 0.85,
                  symbolSize: 20,
                  effects: [
                    {
                      on: "hover",
                      style: {
                        itemOpacity: 1,
                      },
                    },
                  ],
                },
              ]}
              role="application"
              ariaLabel="Nivo bar chart demo"
            /> */}
            {person.name}
          </Box>
        );
      })}
      <Typography component="div" variant="h2">
        asc
      </Typography>
      {props.peopleAsc.map((person) => {
        const occupationSet = new Set();
        const yo = {};
        for (const year of years) {
          yo[year] = [];
        }
        for (const relatedMovie of person.relatedMovies) {
          occupationSet.add(relatedMovie.occupation.name);
          yo[relatedMovie.movie.productionYear].push(
            relatedMovie.occupation.name
          );
        }
        const occupations = Array.from(occupationSet);

        const data = years.map((year) => {
          const d = { year };
          for (const occupation of occupations) {
            d[occupation] = yo[year].filter((o) => o === occupation).length;
          }
          return d;
        });

        return (
          <Box sx={{ mt: 10, height: 300, width: "100%" }} key={person.id}>
            {/* <ResponsiveBar
              data={data}
              keys={occupations}
              indexBy="year"
              margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
              padding={0.3}
              valueScale={{ type: "linear" }}
              indexScale={{ type: "band", round: true }}
              colors={{ scheme: "set3" }}
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: "year",
                legendPosition: "middle",
                legendOffset: 32,
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: "count",
                legendPosition: "middle",
                legendOffset: -40,
                format: (e) => Math.floor(e) === e && e,
              }}
              labelSkipWidth={12}
              labelSkipHeight={12}
              labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
              legends={[
                {
                  dataFrom: "keys",
                  anchor: "bottom-right",
                  direction: "column",
                  justify: false,
                  translateX: 120,
                  translateY: 0,
                  itemsSpacing: 2,
                  itemWidth: 100,
                  itemHeight: 20,
                  itemDirection: "left-to-right",
                  itemOpacity: 0.85,
                  symbolSize: 20,
                  effects: [
                    {
                      on: "hover",
                      style: {
                        itemOpacity: 1,
                      },
                    },
                  ],
                },
              ]}
              role="application"
              ariaLabel="Nivo bar chart demo"
            /> */}
            {person.name}
          </Box>
        );
      })}
    </Container>
  );
};

export const getServerSideProps = async (req, res) => {
  const people = await prisma.person.findMany({
    include: {
      relatedMovies: {
        include: { occupation: true, movie: true },
      },
    },
    orderBy: {
      relatedMovies: {
        _count: "desc",
      },
    },
    take: 50,
  });
  const peopleAsc = await prisma.person.findMany({
    include: {
      relatedMovies: {
        include: { occupation: true, movie: true },
      },
    },
    orderBy: {
      relatedMovies: {
        _count: "asc",
      },
    },
    take: 50,
  });

  return {
    props: {
      people: forceSerialize(people),
      peopleAsc: forceSerialize(peopleAsc),
    },
  };
};

export default Bar;
