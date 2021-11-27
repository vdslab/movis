export const forceSerialize = (data) => {
  return JSON.parse(JSON.stringify(data));
};
