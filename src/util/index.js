import { FILMARKS_BASE_URL, TMDB_IMG_BASE_URL } from "@/const";
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
  const tmdbProfilePath = tmdbSearchResult.results?.[0]?.profile_path;
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
  // const andFilteredMovieIds = Array.from(
  //   new Set(
  //     movies
  //       .filter((movie) => {
  //         const movieProductionMemberIds = movie.productionMembers.map(
  //           (pm) => pm.person.id
  //         );
  //         const and = selectedNodeIds.every((nodeId) =>
  //           movieProductionMemberIds.includes(nodeId)
  //         );

  //         return and;
  //       })
  //       .map((movie) => movie.id)
  //   )
  // );

  // 選択ノードの'または'で絞り込んだmovie ids
  // const orFilteredMovieIds = Array.from(
  //   new Set(
  //     movies
  //       .filter((movie) => {
  //         const movieProductionMemberIds = movie.productionMembers.map(
  //           (pm) => pm.person.id
  //         );
  //         const or = selectedNodeIds.some((nodeId) =>
  //           movieProductionMemberIds.includes(nodeId)
  //         );

  //         return or;
  //       })
  //       .map((movie) => movie.id)
  //   )
  // );

  // 選択ノードの'かつ'で絞り込んだmovies
  const andFilteredMovies = Array.from(
    new Set(
      movies.filter((movie) => {
        const movieProductionMemberIds = movie.productionMembers.map(
          (pm) => pm.person.id
        );
        const and = selectedNodeIds.every((nodeId) =>
          movieProductionMemberIds.includes(nodeId)
        );

        return and;
      })
    )
  );

  return andFilteredMovies;
};

export const filterMovieByGenre = (movies, selectedGenreIds) => {
  if (selectedGenreIds.length === 0) {
    return [];
  }

  // 選択ジャンルの'かつ'で絞り込んだmovie ids
  // const andFilteredMovieIds = Array.from(
  //   new Set(
  //     movies
  //       .filter((movie) => {
  //         const movieGenres = movie.genres.map((genre) => genre.id);

  //         const and = selectedGenreIds.every((genreId) =>
  //           movieGenres.includes(genreId)
  //         );

  //         return and;
  //       })
  //       .map((movie) => movie.id)
  //   )
  // );

  // 選択ジャンルの'または'で絞り込んだmovie ids
  // const orFilteredMovieIds = Array.from(
  //   new Set(
  //     movies
  //       .filter((movie) => {
  //         const movieGenres = movie.genres.map((genre) => genre.id);

  //         const or = selectedGenreIds.some((genreId) =>
  //           movieGenres.includes(genreId)
  //         );

  //         return or;
  //       })
  //       .map((movie) => movie.id)
  //   )
  // );

  // 選択ジャンルの'または'で絞り込んだmovies
  const orFilteredMovies = Array.from(
    new Set(
      movies.filter((movie) => {
        const movieGenres = movie.genres.map((genre) => genre.id);

        const or = selectedGenreIds.some((genreId) =>
          movieGenres.includes(genreId)
        );

        return or;
      })
    )
  );

  return orFilteredMovies;
};

export const filterMovieByYear = (movies, selectedYears) => {
  if (selectedYears.length === 0) {
    return [];
  }

  const filteredMovieIds = Array.from(
    new Set(
      movies
        .filter((movie) => selectedYears.includes(movie.productionYear))
        .map((movie) => movie.id)
    )
  );

  const filteredMovies = movies.filter((movie) =>
    filteredMovieIds.includes(movie.id)
  );

  return filteredMovies;
};

export const string2int = (str) => {
  return Number.isInteger(Number(str)) ? Number(str) : void 0;
};

export const generateBarData = (relatedMovies, occupations, years) => {
  const occupationNameSet = new Set();
  const y2o = {};
  for (const year of years) {
    y2o[year] = [];
  }
  for (const rm of relatedMovies) {
    occupationNameSet.add(rm.occupation.name);
    y2o[rm.movie.productionYear].push(rm.occupation.name);
  }

  const relatedOccupationNames = Array.from(occupationNameSet);

  const data = years.map((year) => {
    const datum = { year };

    for (const name of relatedOccupationNames) {
      datum[name] = y2o[year].filter((o) => o === name).length;
    }

    return datum;
  });

  const keys = occupations.map((o) => o.name);

  const barData = {
    data,
    keys,
  };

  return barData;
};

export const generateNetworkData = (relatedMovies) => {
  const actorOccupationName = "出演者";
  const countWithMainKey = "countWithMain";
  const relatedMoviesCountKey = "relatedMoviesCount";

  // link
  const linkDistance = 10;
  const s2t = {};
  relatedMovies.forEach((rm) => {
    if (rm.occupation.name !== actorOccupationName) {
      return;
    }

    rm.movie.productionMembers.forEach((spm, index) => {
      const sId = spm.person.id;
      if (!(sId in s2t)) {
        s2t[sId] = { [countWithMainKey]: 0 };
      }
      ++s2t[sId][countWithMainKey];

      rm.movie.productionMembers.slice(index + 1).forEach((tpm) => {
        const tId = tpm.person.id;

        s2t[sId][tId] = (s2t[sId][tId] || 0) + 1;
      });
    });
  });

  const links = [];

  for (const sId in s2t) {
    for (const tId in s2t[sId]) {
      if (tId === countWithMainKey) {
        continue;
      }

      links.push({
        source: sId,
        target: tId,
        weight: s2t[sId][tId],
        d: linkDistance,
      });
    }
  }

  // node
  const p2n = {};
  relatedMovies.forEach((rm) => {
    if (rm.occupation.name !== actorOccupationName) {
      return;
    }

    rm.movie.productionMembers.forEach((pm) => {
      const p = pm.person;
      p2n[p.id] = {
        id: p.id,
        name: p.name,
        [countWithMainKey]: s2t[p.id][countWithMainKey],
        [relatedMoviesCountKey]: p[relatedMoviesCountKey],
      };
    });
  });
  const nodes = Object.values(p2n);

  const countWithMains = nodes.map((node) => node[countWithMainKey]);
  const countWithMainMax = Math.max(...countWithMains);
  const countWithMainMin = 0;

  const relatedMoviesCounts = nodes.map((node) => node[relatedMoviesCountKey]);
  const relatedMoviesCountMax = Math.max(...relatedMoviesCounts);
  const relatedMoviesCountMin = 0;

  for (const node of nodes) {
    const normalizedCountWithMain =
      countWithMainMax !== countWithMainMin
        ? (node[countWithMainKey] - countWithMainMin) /
          (countWithMainMax - countWithMainMin)
        : 0;

    const normalizedRelatedMoviesCount =
      relatedMoviesCountMax !== relatedMoviesCountMin
        ? (node[relatedMoviesCountKey] - relatedMoviesCountMin) /
          (relatedMoviesCountMax - relatedMoviesCountMin)
        : 0;
    node["normalizedCountWithMain"] = normalizedCountWithMain;
    node["normalizedRelatedMoviesCount"] = normalizedRelatedMoviesCount;
    node["r"] = normalizedCountWithMain * 200;
  }

  // network
  const network = { nodes, links };

  return network;
};

export const getByteSize = (v) => Buffer.byteLength(JSON.stringify(v));

export const generateFilmarksMovieUrl = (id) => {
  return `${FILMARKS_BASE_URL.movie}/${id}`;
};

export const generateFilmarksPersonUrl = (id) => {
  return `${FILMARKS_BASE_URL.person}/${id}`;
};
