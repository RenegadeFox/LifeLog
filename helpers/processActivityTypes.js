import { readLastActivityByType } from "../models/activityModel.js";
import { getTimeDifference } from "./getTimeDifference.js";

export const processActivityTypes = async (activityTypes, category) => {
  const uncategorizedItems = [];
  const startedMenuItems = [];
  const itemIds = [];

  const output = await Promise.all(
    activityTypes.map(async (activityType) => {
      // Get the last logged activity of this type from the database
      const lastActivity = await readLastActivityByType(activityType.id);
      // Set the time elapsed to "N/A" by default
      let timeElapsed = "N/A";
      // Set the activity label to the activity type name by default
      let activityLabel = activityType.name;
      // Activity status
      let activityStatus = "none";
      // Check if the activity type is a "start" activity
      const isStartActivity = lastActivity && lastActivity.status === "start";
      // Check if the activity type is an "end" activity
      const isEndActivity = lastActivity && lastActivity.status === "end";
      // Check if the activity type is an "uncategorized" activity
      const isUncategorized = category === "Uncategorized";

      // Check if there is a logged activity of this type
      if (!lastActivity) {
        // Check if the activity type is a toggle activity
        if (!activityType.toggle) {
          timeElapsed = "N/A";
          activityLabel = activityType.name;
        } else if (activityType.toggle) {
          // If there is no logged activity AND the activity type is a toggle activity
          timeElapsed = "N/A";
          activityLabel = activityType.start_label;
          activityStatus = "start";
        }
      } else if (lastActivity) {
        // There is a logged activity of this type
        // Calculate the time elapsed since the last activity was logged
        timeElapsed = getTimeDifference(lastActivity.timestamp);
        // Check if the activity type is a toggle activity
        if (!activityType.toggle) {
          activityLabel = activityType.name;
          activityStatus = "none";
        } else if (activityType.toggle) {
          // If the activity type is a toggle activity
          // Check if the last activity was a start activity
          if (isStartActivity) {
            // Set the activity label to the end activity label
            activityLabel = activityType.end_label;
            activityStatus = "start";
          } else if (isEndActivity) {
            // If the last activity was an end activity, set the activity label to the start activity label
            activityLabel = activityType.start_label;
            activityStatus = "end";
          }
        }
      } // End of if (lastActivity)

      // Add the activity type details to the itemIds array
      itemIds.push({
        id: activityType.id,
        name: activityLabel,
        status: activityStatus,
      });

      // Process it if it's a started activity
      if (isStartActivity) {
        startedMenuItems.push(`${activityLabel} (${timeElapsed})`);
        return { name: null, timeElapsed: null };
      }

      // Check if the activity type is uncategorized
      if (isUncategorized) {
        uncategorizedItems.push({
          name: activityLabel,
          timestamp: lastActivity ? lastActivity.timestamp : 0,
          timeElapsed,
        });
        return { name: null, timeElapsed: null };
      }

      return { name: activityLabel, timeElapsed };
    })
  ); // End of Promise.all

  return {
    activityTypes: output,
    started: startedMenuItems,
    uncategorized: uncategorizedItems,
    itemIds,
  };
};
