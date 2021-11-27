import { Container, Box } from "@mui/material";
// import { ResponsiveChord } from "@nivo/chord";

import prisma from "@/lib/prisma";
import { forceSerialize } from "@/util";

const Bar = (props) => {
  console.log(props);
  const keys = Object.keys(props.genre);
  const matrix = [];
  for (const k of keys) {
    const a = [];
    for (const kk of keys) {
      a.push(props.genre[k][kk]);
    }
    matrix.push(a);
  }
  console.log(matrix);

  return (
    <Container sx={{ pt: 5 }}>
      <Box sx={{ mt: 10, height: 1000, width: "100%" }}>
        {/* <ResponsiveChord
          matrix={matrix}
          keys={keys}
          margin={{ top: 60, right: 60, bottom: 90, left: 60 }}
          valueFormat=".2f"
          padAngle={0.02}
          innerRadiusRatio={0.96}
          innerRadiusOffset={0.02}
          arcOpacity={1}
          arcBorderWidth={1}
          arcBorderColor={{ from: "color", modifiers: [["darker", 0.4]] }}
          ribbonOpacity={0.5}
          ribbonBorderWidth={1}
          ribbonBorderColor={{ from: "color", modifiers: [["darker", 0.4]] }}
          enableLabel={true}
          label="id"
          labelOffset={12}
          labelRotation={-90}
          labelTextColor={{ from: "color", modifiers: [["darker", 1]] }}
          colors={{ scheme: "nivo" }}
          isInteractive={true}
          arcHoverOpacity={1}
          arcHoverOthersOpacity={0.25}
          ribbonHoverOpacity={0.75}
          ribbonHoverOthersOpacity={0.25}
          animate={true}
          motionStiffness={90}
          motionDamping={7}
          legends={[
            {
              anchor: "bottom",
              direction: "row",
              justify: false,
              translateX: 0,
              translateY: 70,
              itemWidth: 80,
              itemHeight: 14,
              itemsSpacing: 0,
              itemTextColor: "#999",
              itemDirection: "left-to-right",
              symbolSize: 12,
              symbolShape: "circle",
              effects: [
                {
                  on: "hover",
                  style: {
                    itemTextColor: "#000",
                  },
                },
              ],
            },
          ]}
        /> */}
      </Box>
    </Container>
  );
};

export const getServerSideProps = async (req, res) => {
  const genres = await prisma.genre.findMany({
    include: {
      _count: true,
    },
  });

  const movies = await prisma.movie.findMany({
    include: {
      genres: true,
    },
    orderBy: {
      genres: {
        _count: "desc",
      },
    },
    // bad hack (- v -)
    take: 23332,
  });

  const genre = {};
  for (const g of genres) {
    genre[g.name] = {};
    for (const gg of genres) {
      genre[g.name][gg.name] = 0;
    }
  }

  for (const movie of movies) {
    for (const g of movie.genres) {
      for (const gg of movie.genres) {
        genre[g.name][gg.name] += 1;
      }
    }
  }

  return {
    props: {
      genres: forceSerialize(genres),
      movies: forceSerialize(movies),
      genre: forceSerialize(genre),
    },
  };
};

export default Bar;
