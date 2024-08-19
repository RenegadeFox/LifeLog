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
      // Check if the activity is "started" or not
      const isStartedActivity =
        lastActivity && lastActivity.status === "started";
      // Check if the activity is "not-started" or not
      const isEndedActivity =
        lastActivity && lastActivity.status === "not-started";
      // Check if the activity type is an "uncategorized" activity
      const isUncategorized = category === "Uncategorized";

      // Check if there is a logged activity of this type
      if (!lastActivity) {
        // Check if the activity type is a toggle activity
        if (!activityType.toggle) {
          // Since it's NOT a toggle activity
          // - Set the time elapsed to "N/A"
          // - Set the activity label to the activity type name
          // - Set the activity status to "none"
          timeElapsed = "N/A";
          activityLabel = activityType.name;
          activityStatus = "none";
        } else if (activityType.toggle) {
          // If there is no logged activity AND the activity type is a toggle activity
          // - Set the time elapsed to "N/A"
          // - Set the activity label to the start activity label
          // - Set the activity status to "not-started"
          timeElapsed = "N/A";
          activityLabel = activityType.start_label;
          activityStatus = "not-started";
        }
      } else if (lastActivity) {
        // There is a logged activity of this type
        // Calculate the time elapsed since the last activity was logged
        timeElapsed = getTimeDifference(lastActivity.timestamp);
        // Check if the activity type is a toggle activity
        if (!activityType.toggle) {
          // If the activity type is NOT a toggle activity AND there is a logged activity
          // - Set the activity label to the activity type name
          // - Set the activity status to "none"
          activityLabel = activityType.name;
          activityStatus = "none";
        } else if (activityType.toggle) {
          // If the activity type is a toggle activity
          // Check if the last activity was STARTED
          if (isStartedActivity) {
            // - Set the activity label to the end activity label
            // - Set the activity status to "started"
            // Add the game, movie, or TV show to the label, if any
            switch (activityType.name.toLowerCase()) {
              case "gaming":
                const game = lastActivity.description.split("Game: ")[1];
                activityLabel = activityType.end_label.replace(/gaming/i, game);
                break;
              case "watching tv":
                const tvShow = lastActivity.description.split("Show: ")[1];
                activityLabel = activityType.end_label.replace(
                  /watching tv/i,
                  tvShow
                );
                break;
              case "watching movie":
                const movie = lastActivity.description.split("Movie: ")[1];
                activityLabel = activityType.end_label.replace(
                  /watching movie/i,
                  movie
                );
                break;
              default:
                activityLabel = activityType.end_label;
                break;
            }
            activityStatus = "started";
          } else if (isEndedActivity) {
            // If the last activity was NOT started
            // - Set the activity label to the start activity label
            // - Set the activity status to "not-started"
            activityLabel = activityType.start_label;
            activityStatus = "not-started";
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
      if (isStartedActivity) {
        // Add the started activity to the startedMenuItems array
        startedMenuItems.push(`${activityLabel} (${timeElapsed})`);
        // Return null for the activity name and time elapsed to skip it
        return { name: null, timeElapsed: null };
      }

      // Check if the activity type is uncategorized
      if (isUncategorized) {
        // Add the uncategorized activity to the uncategorizedItems array
        uncategorizedItems.push({
          name: activityLabel,
          timestamp: lastActivity ? lastActivity.timestamp : 0,
          timeElapsed,
        });
        // Return null for the activity name and time elapsed to skip it
        return { name: null, timeElapsed: null };
      }

      // Return the activity type name and time elapsed
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

export const processActivityTypesV2 = async (activityTypes, category) => {
  const uncategorizedItems = [];
  const startedMenuItems = [];

  const associatedActivityTypes = await Promise.all(
    activityTypes.map(async (activityType) => {
      // Get the last logged activity of this type from the database
      const lastActivity = await readLastActivityByType(activityType.id);
      // Set the time elapsed to "N/A" by default
      let timeElapsed = "N/A";
      // Set the activity label to the activity type name by default
      let activityLabel = activityType.name;
      // Activity status
      let activityStatus = "none";
      // Check if the activity is "started" or not
      const isStartedActivity =
        lastActivity && lastActivity.status === "started";
      // Check if the activity is "not-started" or not
      const isEndedActivity =
        lastActivity && lastActivity.status === "not-started";
      // Check if the activity type is an "uncategorized" activity
      const isUncategorized = category === "Uncategorized";
      // Check if the activity type is a toggle activity
      const isToggleActivity = activityType.toggle;

      // Check if there is a logged activity of this type
      if (!lastActivity) {
        // Check if the activity type is a toggle activity
        if (!isToggleActivity) {
          // Since it's NOT a toggle activity
          // - Set the time elapsed to "N/A"
          // - Set the activity label to the activity type name
          // - Set the activity status to "none"
          timeElapsed = "N/A";
          activityLabel = activityType.name;
          activityStatus = "none";
        } else if (isToggleActivity) {
          // If there is no logged activity AND the activity type is a toggle activity
          // - Set the time elapsed to "N/A"
          // - Set the activity label to the start activity label
          // - Set the activity status to "not-started"
          timeElapsed = "N/A";
          activityLabel = activityType.start_label;
          activityStatus = "not-started";
        }
      } else if (lastActivity) {
        // There is a logged activity of this type
        // Calculate the time elapsed since the last activity was logged
        timeElapsed = getTimeDifference(lastActivity.timestamp);
        // Check if the activity type is a toggle activity
        if (!isToggleActivity) {
          // If the activity type is NOT a toggle activity AND there is a logged activity
          // - Set the activity label to the activity type name
          // - Set the activity status to "none"
          activityLabel = activityType.name;
          activityStatus = "none";
        } else if (isToggleActivity) {
          // If the activity type is a toggle activity
          // Check if the last activity was STARTED
          if (isStartedActivity) {
            // - Set the activity label to the end activity label
            // - Set the activity status to "started"
            // Add the game, movie, or TV show to the label, if any
            switch (activityType.name.toLowerCase()) {
              case "gaming":
                const game = lastActivity.description.split("Game: ")[1];
                activityLabel = activityType.end_label.replace(/gaming/i, game);
                break;
              case "watching tv":
                const tvShow = lastActivity.description.split("Show: ")[1];
                activityLabel = activityType.end_label.replace(
                  /watching tv/i,
                  tvShow
                );
                break;
              case "watching movie":
                const movie = lastActivity.description.split("Movie: ")[1];
                activityLabel = activityType.end_label.replace(
                  /watching movie/i,
                  movie
                );
                break;
              default:
                activityLabel = activityType.end_label;
                break;
            }
            activityStatus = "started";
          } else if (isEndedActivity) {
            // If the last activity was NOT started
            // - Set the activity label to the start activity label
            // - Set the activity status to "not-started"
            activityLabel = activityType.start_label;
            activityStatus = "not-started";
          }
        }
      } // End of if (lastActivity)

      // Process it if it's a started activity
      if (isStartedActivity) {
        // Add the started activity to the startedMenuItems array
        // startedMenuItems.push(`${activityLabel} (${timeElapsed})`);
        startedMenuItems.push({
          type_id: activityType.id,
          emoji: activityType.emoji,
          name: activityLabel,
          timestamp: lastActivity.timestamp,
          timeElapsed,
          status: activityStatus,
        });
        // Return null for the activity name and time elapsed to skip it since we're adding it to the startedMenuItems array
        return { name: null, timeElapsed: null };
      }

      // Check if the activity type is uncategorized
      if (isUncategorized) {
        // Add the uncategorized activity to the uncategorizedItems array
        uncategorizedItems.push({
          type_id: activityType.id,
          emoji: activityType.emoji,
          name: activityLabel,
          timestamp: lastActivity ? lastActivity.timestamp : 0,
          timeElapsed,
        });
        // Return null for the activity name and time elapsed to skip it
        return { name: null, timeElapsed: null };
      }

      // Return the activity type name and time elapsed
      return {
        type_id: activityType.id,
        emoji: activityType.emoji,
        name: activityLabel,
        timeElapsed,
        status: activityStatus,
        timestamp: lastActivity ? lastActivity.timestamp : 0,
      };
    })
  ); // End of Promise.all

  return {
    activityTypes: associatedActivityTypes,
    started: startedMenuItems,
    uncategorized: uncategorizedItems,
  };
};
