// import {
//   Container,
//   List,
//   ListItemAvatar,
//   Avatar,
//   ListItemText,
//   Divider,
//   ListItemButton,
//   Typography,
// } from "@mui/material";
// import { useRouter } from "next/router";
// import { useForm } from "react-hook-form";

// import { Link } from "@/components/Link";
// import prisma from "@/lib/prisma";
// import { forceSerialize } from "@/util/index";

// const Search = (props) => {
//   // これいるか？
//   const { register, handleSubmit } = useForm({
//     defaultValues: { name: props.name },
//   });
//   const router = useRouter();

//   return (
//     <Container maxWidth="sm" sx={{ pt: 5 }}>
//       {/* movie list */}
//       <Typography component="div" variant="h4">
//         映画
//       </Typography>
//       <List sx={{ width: "100%" }}>
//         {props.movies.map((movie, index) => {
//           return (
//             <Link
//               href={{
//                 pathname: "/movie/[movieId]",
//                 query: { movieId: movie.id },
//               }}
//               sx={{ textDecoration: "none", color: "currentcolor" }}
//               key={movie.id}
//             >
//               <ListItemButton alignItems="center">
//                 <ListItemAvatar>
//                   <Avatar
//                     variant="square"
//                     alt={movie.title}
//                     src={movie.imgUrl}
//                   />
//                 </ListItemAvatar>
//                 <ListItemText primary={movie.title} />
//               </ListItemButton>
//               {index + 1 < props.movies.length ? (
//                 <Divider variant="inset" component="li" />
//               ) : null}
//             </Link>
//           );
//         })}
//       </List>

//       {/* person list */}
//       <Typography component="div" variant="h4">
//         人物
//       </Typography>
//       <List sx={{ width: "100%" }}>
//         {props.people.map((person, index) => {
//           return (
//             <Link
//               href={{
//                 pathname: "/person/[personId]",
//                 query: { personId: person.id },
//               }}
//               sx={{ textDecoration: "none", color: "currentcolor" }}
//               key={person.id}
//             >
//               <ListItemButton alignItems="center">
//                 <ListItemAvatar>
//                   <Avatar
//                     variant="square"
//                     alt={person.name}
//                     src="https://www.tokyoedm.com/wp-content/uploads/2019/10/70322245_2365066260374471_3032238497135067136_n.jpg"
//                   />
//                 </ListItemAvatar>
//                 <ListItemText primary={person.name} />
//               </ListItemButton>
//               {index + 1 < props.people.length ? (
//                 <Divider variant="inset" component="li" />
//               ) : null}
//             </Link>
//           );
//         })}
//       </List>
//     </Container>
//   );
// };

// export const getServerSideProps = async (req, res) => {
//   const name = req.query.name;

//   const people = await prisma.person.findMany({
//     where: {
//       name: { contains: name },
//     },
//     include: {
//       relatedMovies: {
//         include: {
//           occupation: true,
//           movie: true,
//         },
//       },
//     },
//   });

//   const movies = await prisma.movie.findMany({
//     where: {
//       title: {
//         contains: name,
//       },
//     },
//   });

//   return {
//     props: {
//       name: name,
//       people: forceSerialize(people),
//       movies: forceSerialize(movies),
//     },
//   };
// };

// export default Search;

import prisma from "@/lib/prisma";

const Search = () => {
  return null;
};

export const getServerSideProps = async (ctx) => {
  const { query } = ctx;
  const { name } = query;

  // ゴミ処理　名前がびみょい
  const movieHitCount = await prisma.movie.count({
    where: {
      title: {
        contains: name,
      },
    },
  });

  // ゴミ処理　名前がびみょい
  const personHitCount = await prisma.person.count({
    where: {
      name: {
        contains: name,
      },
    },
  });

  // personが1件でもヒットすればpersonに飛ばせる
  // ゴミ処理　リダイレクト後に再度件数取得は馬鹿馬鹿しいのでqueryStringsで送るけどどうなのかこれ
  const encodedName = encodeURIComponent(name);
  return {
    redirect: {
      permanent: false,
      destination:
        0 < personHitCount
          ? `/search/${encodedName}/person?movieHitCount=${movieHitCount}&personHitCount=${personHitCount}`
          : `/search/${encodedName}/movie?movieHitCount=${movieHitCount}&personHitCount=${personHitCount}`,
    },
  };
};

export default Search;
