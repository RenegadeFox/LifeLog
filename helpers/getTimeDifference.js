export const getTimeDifference = (timestamp) => {
  const timestampInMs = timestamp * 1000;
  const timeElapsed = Date.now() - timestampInMs;

  // Calculate the time difference in seconds, minutes, hours, days, weeks, months, years
  const seconds = Math.floor(timeElapsed / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  let timeString;

  if (years > 0) {
    timeString = `${years} year${years > 1 ? "s" : ""} ago`;
  } else if (months > 0) {
    timeString = `${months} month${months > 1 ? "s" : ""} ago`;
  } else if (weeks > 0) {
    timeString = `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  } else if (days > 0) {
    timeString = `${days} day${days > 1 ? "s" : ""} ago`;
  } else if (hours > 0) {
    timeString = `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else if (minutes > 0) {
    timeString = `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else {
    timeString = `${seconds} second${seconds > 1 ? "s" : ""} ago`;
  }

  return timeString;
};
