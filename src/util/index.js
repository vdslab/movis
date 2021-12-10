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
