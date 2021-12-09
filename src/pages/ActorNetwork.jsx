import { Container, Box } from "@mui/material";

import { ActorNetwork } from "@/components/ActorNetwork";
import { Responsive } from "@/components/Responsive";
import prisma from "@/lib/prisma";
import { forceSerialize } from "@/util";

const Network = (props) => {
  return (
    <Container>
      <Box sx={{ height: 800 }}>
        <Responsive
          render={(width, height) => {
            const size = Math.min(width, height);

            return (
              <Box
                sx={{ width: size, height: size, border: "1px solid black" }}
              >
                <ActorNetwork width={size} height={size} {...props} />
              </Box>
            );
          }}
        />
      </Box>
    </Container>
  );
};

export const getServerSideProps = async () => {
  const actorOccupationName = "出演者";

  const personId = "8161c2be-6e88-45d1-8cca-541fcf63c040";
  const person = await prisma.person.findFirst({
    where: {
      id: personId,
    },
    select: {
      relatedMovies: {
        select: {
          movie: {
            select: {
              productionMembers: {
                select: {
                  person: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                  occupation: {
                    select: {
                      name: true,
                      id: true,
                    },
                  },
                },
                where: {
                  AND: [
                    {
                      occupation: {
                        is: {
                          name: actorOccupationName,
                        },
                      },
                    },
                    {
                      personId: {
                        not: personId,
                      },
                    },
                  ],
                },
                orderBy: {
                  personId: "desc",
                },
              },
            },
          },
        },
        where: {
          occupation: {
            is: {
              name: actorOccupationName,
            },
          },
        },
      },
    },
  });

  const sourceTarget = {};
  person.relatedMovies.forEach((rm) => {
    rm.movie.productionMembers.forEach((spm, index) => {
      const sourceId = spm.person.id;
      if (sourceId in sourceTarget === false) {
        // countWithMainは中心となる俳優との共演回数
        sourceTarget[sourceId] = { countWithMain: 0 };
      }
      ++sourceTarget[sourceId].countWithMain;

      rm.movie.productionMembers.slice(index + 1).forEach((tpm) => {
        const targetId = tpm.person.id;
        // この値は俳優同士の共演回数
        sourceTarget[sourceId][targetId] =
          (sourceTarget[sourceId][targetId] || 0) + 1;
      });
    });
  });

  const links = [];
  for (const sourceId in sourceTarget) {
    if (sourceId === "countWithMain") {
      continue;
    }
    for (const targetId in sourceTarget[sourceId]) {
      if (targetId === "countWithMain") {
        continue;
      }
      links.push({
        source: sourceId,
        target: targetId,
        weight: sourceTarget[sourceId][targetId],
        d: 10,
      });
    }
  }

  const nodeBase = {};
  person.relatedMovies.forEach((rm) => {
    rm.movie.productionMembers.forEach((pm) => {
      nodeBase[pm.person.id] = {
        ...pm.person,
        count: sourceTarget[pm.person.id].countWithMain,
      };
    });
  });
  const nodes = Object.values(nodeBase);

  const counts = nodes.map((node) => node.count);
  const countMax = Math.max(...counts);
  const countMin = Math.min(...counts);

  for (const node of nodes) {
    const normalizedCount =
      countMax !== countMin
        ? (node.count - countMin) / (countMax - countMin)
        : 0.5;
    node["normalizedCount"] = normalizedCount;
    node["r"] = (normalizedCount + 0.1) * 20;
  }

  const network = { nodes, links };

  const data = { person, network };

  return {
    props: {
      data: forceSerialize(data),
    },
  };
};

export default Network;
