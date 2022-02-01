export const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
// export const TMDB_API_KEY = process.env.TMDB_API_KEY;

export const APP_BASE_URL = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `htpps://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : "";
