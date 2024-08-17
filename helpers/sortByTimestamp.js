export const sortByTimestamp = (a, b) => {
  if (a.timestamp === 0) return 1;
  if (b.timestamp === 0) return -1;
  return a.timestamp - b.timestamp;
};
