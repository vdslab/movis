import { forceSerialize } from "@/util";

const PersonSearchResult = (props) => {
  console.log(props);
  return "hello";
};

export const getServerSideProps = async (ctx) => {
  const { query } = ctx;
  const { name, movieHitCount, personHitCount } = query;

  return {
    props: forceSerialize({ name, movieHitCount, personHitCount }),
  };
};

export default PersonSearchResult;