import {
  createActivityType,
  readAllActivityTypes,
  updateActivityTypeById,
  readActivityTypeById,
  deleteActivityTypeById,
} from "../models/activityTypeModel.js";
import { readLastActivityByType } from "../models/activityModel.js";
import { readAllCategories } from "../models/categoryModel.js";
import { getTimeDifference } from "../helpers/getTimeDifference.js";

// Create a new activity type in the database
export const addActivityType = async (req, res) => {
  const isMultipleTypes = Array.isArray(req.body);

  // Check if the request body is an array of activity types to be created
  if (isMultipleTypes) {
    const activityTypes = req.body;
    try {
      const ids = await Promise.all(
        activityTypes.map(async (activityType) => {
          const { name, toggle, start_label, end_label, category_id } =
            activityType;
          return await createActivityType(
            name,
            toggle,
            start_label,
            end_label,
            category_id
          );
        })
      );
      res.status(201).send(ids);
    } catch (err) {
      res.status(500).send(err.message);
    }
  } else {
    const { name, toggle, start_label, end_label, category_id } = req.body;
    try {
      const id = await createActivityType(
        name,
        toggle,
        start_label,
        end_label,
        category_id
      );
      res.status(201).send({ id });
    } catch (err) {
      res.status(500).send(err.message);
    }
  }
};

// Get all activity types from the database
export const getAllActivityTypes = async (req, res) => {
  try {
    const allActivityTypes = await readAllActivityTypes();
    res.status(200).json(allActivityTypes);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Get a single activity type from the database by its ID
export const getActivityTypeById = async (req, res) => {
  const { id } = req.params;

  try {
    const activityType = await readActivityTypeById(id);

    if (activityType) res.status(200).json(activityType);
    else res.status(404).send(`Activity type with ID "${id}" not found`);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Get a single activity type from the database by its ID
export const editActivityTypeById = async (req, res) => {
  const { id } = req.params;
  const { name, toggle, startLabel, endLabel, categoryId } = req.body;

  // Return an error, if neither "name" nor "toggle" is provided in the request body
  if (!name && !toggle && !startLabel && !endLabel && !categoryId) {
    return res
      .status(400)
      .send("Missing name, toggle, startLabel, endLabel, categoryId");
  }

  // Update the activity type in the database
  try {
    const originalActivityType = await readActivityTypeById(id);
    if (!originalActivityType)
      return res.status(404).send(`Activity type with ID "${id}" not found`);

    // Only update the fields that are provided in the request body
    const newName = name || originalActivityType.name;
    const newToggle = toggle || originalActivityType.toggle;
    const newStartLabel = startLabel || originalActivityType.start_label;
    const newEndLabel = endLabel || originalActivityType.end_label;
    const newCategoryId = categoryId || originalActivityType.category_id;

    const changes = await updateActivityTypeById(
      id,
      newName,
      newToggle,
      newStartLabel,
      newEndLabel,
      newCategoryId
    );
    return res.status(200).send({ changes });
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

// Delete an existing activity type from the database by its ID
export const removeActivityTypeById = async (req, res) => {
  const { id } = req.params;

  // Delete the activity type from the database
  try {
    const activityType = await readActivityTypeById(id);
    if (!activityType)
      return res.status(404).send(`Activity type with ID "${id}" not found`);

    const changes = await deleteActivityTypeById(id);
    res.status(200).send({ changes });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Get all available activity types from the database to be used in the menu
// Filters out start/end activity types if they are already in the menu
// e.g. if "Start work" has been logged, "End work" should be the menu item instead of "Start work"
export const getMenuItems = async (req, res) => {
  try {
    const allActivityTypes = await readAllActivityTypes();
    const menuItems = await Promise.all(
      allActivityTypes.map(async (activityType) => {
        const lastActivity = await readLastActivityByType(activityType.id);
        let timeElapsed;

        if (lastActivity && lastActivity.timestamp) {
          timeElapsed = getTimeDifference(lastActivity.timestamp);
        }

        // If the activity type is NOT toggle activity, return the activity type name
        if (!activityType.toggle) {
          return {
            name: activityType.name,
            id: activityType.id,
            status: "none",
            lastLogged: lastActivity ? timeElapsed : "N/A",
          };
        }

        // If there are no logged activities of this type, return the start activity
        if (!lastActivity) {
          return {
            name: activityType.start_label,
            id: activityType.id,
            status: "start",
            lastLogged: "N/A",
          };
        }

        // If there IS a logged activity of this type, return the opposite activity
        if (lastActivity.status === "start") {
          return {
            name: activityType.end_label,
            id: activityType.id,
            status: "end",
            lastLogged: timeElapsed,
          };
        } else {
          return {
            name: activityType.start_label,
            id: activityType.id,
            status: "start",
            lastLogged: timeElapsed,
          };
        }
      })
    );

    // Remove duplicates and format the final menu items
    const uniqueMenuItems = Array.from(
      new Set(
        menuItems.map((item) => {
          return `${item.name} (${item.lastLogged})`;
        })
      )
    );
    res.status(200).json({
      items: uniqueMenuItems,
      ids: menuItems.map((item) => `${item.id},${item.status}`),
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Version 2 of getMenuItems
// TODO: Update to include the category of the activity type with sub-menu items of that activity type
export const getMenuItemsV2 = async (req, res) => {
  try {
    const allActivityTypes = await readAllActivityTypes();
    const menuItems = await Promise.all(
      allActivityTypes.map(async (activityType) => {
        const lastActivity = await readLastActivityByType(activityType.id);
        let timeElapsed;

        // Calculate the time elapsed since the last activity was logged if it's been logged
        if (lastActivity && lastActivity.timestamp) {
          timeElapsed = getTimeDifference(lastActivity.timestamp);
        }

        // If the activity type is NOT a toggle activity, return the activity type name
        if (!activityType.toggle) {
          return {
            name: activityType.name,
            id: activityType.id,
            status: "none",
            timeElapsed: lastActivity ? timeElapsed : "N/A",
            description: activityType.description || "",
            lastLogged: lastActivity ? lastActivity.timestamp : 0,
            category: activityType.category || "Uncategorized",
          };
        }

        // If there are no logged activities of this type, return the start activity
        // Since we know it's not a toggle activity.
        if (!lastActivity) {
          return {
            name: activityType.start_label,
            id: activityType.id,
            status: "start",
            timeElapsed: "N/A",
            description: activityType.description || "",
            lastLogged: 0,
            category: activityType.category || "Uncategorized",
          };
        }

        // If there IS a logged activity of this type, return the opposite activity
        if (lastActivity.status === "start") {
          return {
            name: activityType.end_label,
            id: activityType.id,
            status: "end",
            timeElapsed: timeElapsed,
            description: lastActivity.description || "",
            lastLogged: lastActivity.timestamp || 0,
            category: activityType.category || "Uncategorized",
          };
        } else {
          // Otherwise, return the start activity
          return {
            name: activityType.start_label,
            id: activityType.id,
            status: "start",
            timeElapsed: timeElapsed || "N/A",
            description: lastActivity.description || "",
            lastLogged: lastActivity.timestamp || 0,
            category: activityType.category || "Uncategorized",
          };
        }
      })
    );

    const sortByLastLogged = (a, b) => {
      if (a.lastLogged === 0) return -1;
      if (b.lastLogged === 0) return 1;
      return b.lastLogged - a.lastLogged;
    };

    // Consolidate all of the menu items that are toggleable, with the ones that have a status of "end" (currently in progress) at the top
    const startedItems = menuItems.filter((item) => item.status === "end");
    const endedItems = menuItems.filter((item) => item.status === "start");
    const nonToggleItems = menuItems.filter((item) => item.status === "none");

    // Sort the nonToggleItems so the most recently logged activity is at the top
    nonToggleItems.sort((a, b) => {
      if (a.lastLogged === 0) return -1;
      if (b.lastLogged === 0) return 1;
      return a.lastLogged - b.lastLogged;
    });

    res.status(200).json({
      labels: [
        ...startedItems
          .map((item) => {
            if (item.name.indexOf("gaming") !== -1) {
              const activeGame =
                item.description.indexOf("Game: ") !== -1
                  ? item.description.split("Game: ")[1]
                  : "N/A";
              const activeGameLabel = `${item.name} - ${activeGame} (${item.timeElapsed})`;

              return activeGame !== "N/A"
                ? activeGameLabel
                : `${item.name} (${item.timeElapsed})`;
            }

            return `${item.name} (${item.timeElapsed})`;
          })
          .sort(sortByLastLogged),
        ...endedItems
          .map((item) => `${item.name} (${item.timeElapsed})`)
          .sort(sortByLastLogged),
        ...nonToggleItems
          .map((item) => `${item.name} (${item.timeElapsed})`)
          .sort(sortByLastLogged),
      ],
      ids: [...startedItems, ...endedItems, ...nonToggleItems],
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const getMenuItemsV3 = async (req, res) => {
  try {
    const categoriesItems = {};
    const startedMenuItems = [];
    const uncategorizedItems = [];
    const itemIds = [];
    const allcategories = await readAllCategories();
    const allActivityTypes = await readAllActivityTypes();

    const menuItems = await Promise.all(
      allcategories.map(async (category) => {
        const relatedActivityTypes = allActivityTypes.filter(
          (activityType) => activityType.category === category.name
        );

        return {
          category: category.name,
          activityTypes: await Promise.all(
            relatedActivityTypes.map(async (activityType) => {
              const lastActivity = await readLastActivityByType(
                activityType.id
              );
              let timeElapsed = "N/A";
              let activityLabel = activityType.name;

              // Calculate the time elapsed since the last activity was logged if it's been logged
              if (lastActivity && lastActivity.timestamp) {
                timeElapsed = getTimeDifference(lastActivity.timestamp);

                // If the activity type is a start activity, set the label to the end activity label
                if (lastActivity.status === "start") {
                  // If the activity type is a gaming activity, remove the word "gaming" from the label and add the game name
                  if (activityType.name === "gaming") {
                    activityLabel = `${activityType.end_label.replace(
                      /gaming/i,
                      ""
                    )}${lastActivity.description.split("Game: ")[1]}`;
                  } else {
                    activityLabel = activityType.end_label;
                  }
                }
                // If the activity type is an end activity, set the label to the start activity label
                else if (lastActivity.status === "end") {
                  activityLabel = activityType.start_label;
                }

                itemIds.push({
                  id: activityType.id,
                  name: activityLabel,
                  status: lastActivity.status,
                });
              }

              // Check if the activity type is uncategorized and add it to the uncategorizedItems object
              if (category.name === "Uncategorized") {
                uncategorizedItems.push({
                  name: activityType.name,
                  timeElapsed,
                  timestamp: lastActivity ? lastActivity.timestamp : 0,
                });
                return { name: null, timeElapsed: null };
              }

              // If the activity type is NOT a toggle activity, return the activity type name
              if (!activityType.toggle) {
                itemIds.push({
                  id: activityType.id,
                  name: activityLabel,
                  status: "none",
                });
                return { name: activityType.name, timeElapsed };
              }

              // Going forward, we know that the activity type is a toggle activity

              // If there are no logged activities of this type, return the start activity
              if (!lastActivity) {
                itemIds.push({
                  id: activityType.id,
                  name: activityType.start_label,
                  status: "end",
                });
                return { name: activityType.start_label, timeElapsed };
              }

              // If there IS a logged activity of this type, add it to the startedMenuItems object
              if (lastActivity.status === "start") {
                startedMenuItems.push(`${activityLabel} (${timeElapsed})`);
                return { name: null, timeElapsed: null };
              } else {
                // Otherwise, return the start activity
                return { name: activityType.start_label, timeElapsed };
              }
            })
          ),
        };
      })
    );

    const sortByTimestamp = (a, b) => {
      if (a.timestamp === 0) return 1;
      if (b.timestamp === 0) return -1;
      return a.timestamp - b.timestamp;
    };

    // Create an object with the category as the key and the activity types as an array of values
    menuItems.forEach((menuItem) => {
      // If the category is uncategorized, skip it
      if (menuItem.category === "Uncategorized") return;
      categoriesItems[menuItem.category] = menuItem.activityTypes
        // Filter out any activity types that don't have a name or timeElapsed (e.g. uncategorized items or started items)
        .filter((activityType) => activityType.name && activityType.timeElapsed)
        .map((activityType) => {
          return `${activityType.name} (${activityType.timeElapsed})`;
        });
    });

    res.status(200).json({
      started: startedMenuItems,
      ...categoriesItems,
      uncategorized: [
        ...uncategorizedItems
          .filter((item) => item.timestamp === 0)
          .map((item) => `${item.name} (${item.timeElapsed})`),
        ...uncategorizedItems
          .filter((item) => item.timestamp !== 0)
          .sort(sortByTimestamp)
          .map((item) => `${item.name} (${item.timeElapsed})`),
      ],
      ids: itemIds,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};
