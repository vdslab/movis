import { TMDB_IMG_BASE_URL } from "@/const";
import { TMDB_API_KEY } from "@/env";

export const forceSerialize = (data) => {
  return JSON.parse(JSON.stringify(data));
};

export const fetchTmdbPersonImg = async (name) => {
  const tmdbRes = await fetch(
    `https://api.themoviedb.org/3/search/person?api_key=${TMDB_API_KEY}&language=ja-JP&query=${encodeURIComponent(
      name
    )}&page=1&include_adult=false&region=JP`
  );
  const tmdbSearchResult = await tmdbRes.json();
  const tmdbProfilePath = tmdbSearchResult.results[0]?.profile_path;
  const personImgUrl = tmdbProfilePath
    ? TMDB_IMG_BASE_URL + tmdbProfilePath
    : tmdbProfilePath;

  return personImgUrl;
};

export const filterMovieByNode = (movies, selectedNodeIds) => {
  if (selectedNodeIds.length === 0) {
    return [];
  }

  // 選択ノードの'かつ'で絞り込んだmovie ids
  const andFilteredMovieIds = movies
    .filter((movie) => {
      const movieProductionMemberIds = movie.productionMembers.map(
        (pm) => pm.person.id
      );
      const and = selectedNodeIds.every((nodeId) =>
        movieProductionMemberIds.includes(nodeId)
      );

      return and;
    })
    .map((movie) => movie.id);

  // 選択ノードの'または'で絞り込んだmovie ids
  // const orFilteredMovieIds = movies
  //   .filter((movie) => {
  //     const movieProductionMemberIds = movie.productionMembers.map(
  //       (pm) => pm.person.id
  //     );
  //     const or = selectedNodeIds.some((nodeId) =>
  //       movieProductionMemberIds.includes(nodeId)
  //     );

  //     return or;
  //   })
  //   .map((movie) => movie.id);

  return andFilteredMovieIds;
};

export const filterMovieByGenre = (movies, selectedGenreIds) => {
  if (selectedGenreIds.length === 0) {
    return [];
  }

  // 選択ジャンルの'かつ'で絞り込んだmovie ids
  const andFilteredMovieIds = movies
    .filter((movie) => {
      const movieGenres = movie.genres.map((genre) => genre.id);

      const and = selectedGenreIds.every((genreId) =>
        movieGenres.includes(genreId)
      );

      return and;
    })
    .map((movie) => movie.id);

  // 選択ジャンルの'または'で絞り込んだmovie ids
  // const orFilteredMovieIds = movies
  //   .filter((movie) => {
  //     const movieGenres = movie.genres.map((genre) => genre.id);

  //     const or = selectedGenreIds.some((genreId) =>
  //       movieGenres.includes(genreId)
  //     );

  //     return or;
  //   })
  //   .map((movie) => movie.id);

  return andFilteredMovieIds;
};

export const filterMovieByYear = (movies, selectedYears) => {
  if (selectedYears.length === 0) {
    return [];
  }

  const filteredMovieIds = movies
    .filter((movie) => selectedYears.includes(movie.productionYear))
    .map((movie) => movie.id);

  return filteredMovieIds;
};
