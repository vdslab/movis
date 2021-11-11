const Movie = (props) => {
  console.log(props);
  return movie;
};

export default Movie;

// export const getServerSideProps = async () => {
//     const data= await prisma.person.findMany({
//       where: {
//         name: {
//           contains: "有村",
//         },
//       },
//       include: {
//         relatedMovies: {
//           include: {
//             movie: true,
//           },
//         },
//       },
//     })
//   // const data = await prisma.person.findMany({
//   //   where: {
//   //     name: "宮崎駿",
//   //   },
//   //   include: {
//   //     relatedMovies: {
//   //       include: {
//   //         movie: {
//   //           include: {
//   //             productionCountries: true,
//   //             productionMembers: {
//   //               include: {
//   //                 occupation: true,
//   //               },
//   //             },
//   //           },
//   //         },
//   //         occupation: true,
//   //       },
//   //       where: {
//   //         occupation: {
//   //           is: {
//   //             name: "監督",
//   //           },
//   //         },
//   //       },
//   //     },
//   //   },
//   // });

//   return {
//     props: {
//       data: JSON.parse(JSON.stringify(data)),
//     },
//   };
// };
