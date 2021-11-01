import { css } from "@emotion/react";
import { Box, Container, Typography, Button } from "@mui/material";

import type { NextPage } from "next";

import Link from "@/components/Link";
import prisma from "@/lib/prisma";

const yellowButtonCss = css`
  color: green;
  background-color: yellow;

  :hover {
    background-color: #919100;
  }
`;

const Index: NextPage = (props) => {
  console.log(props);
  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Next.js v5-beta with TypeScript example
        </Typography>

        <Link href="/about" color="secondary">
          Go to the about page
        </Link>
      </Box>
      <Box>
        <Button variant="contained" color="primary">
          Css
        </Button>
        <Button variant="contained" css={yellowButtonCss}>
          Css
        </Button>
      </Box>
    </Container>
  );
};

export default Index;

export const getServerSideProps = async () => {
  const data = await prisma.person.findMany({
    where: {
      name: "宮崎駿",
    },
    include: {
      relatedMovies: {
        include: {
          movie: {
            include: {
              productionCountries: true,
              productionMembers: {
                include: {
                  occupation: true,
                },
              },
            },
          },
          occupation: true,
        },
        where: {
          occupation: {
            is: {
              name: "監督",
            },
          },
        },
      },
    },
  });

  return {
    props: {
      data: JSON.parse(JSON.stringify(data)),
    },
  };
};
