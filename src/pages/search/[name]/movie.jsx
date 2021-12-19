import { forceSerialize } from "@/util";

const MovieSearchResult = (props) => {
  return "hello";
};

export const getServerSideProps = async (ctx) => {
  const { query } = ctx;
  const { name, movieHitCount, personHitCount } = query;

  return {
    props: forceSerialize({ name, movieHitCount, personHitCount }),
  };
};

export default MovieSearchResult;
