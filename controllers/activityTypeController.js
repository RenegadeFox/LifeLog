import {
  createActivityType,
  readAllActivityTypes,
  updateActivityType,
  readActivityTypeById,
  deleteActivityType,
} from "../models/activityTypeModel.js";
import { readLastActivityByType } from "../models/activityModel.js";

// Create a new activity type in the database
export const addActivityType = async (req, res) => {
  const isMultipleTypes = Array.isArray(req.body);

  // Check if the request body is an array of activity types to be created
  if (isMultipleTypes) {
    const activityTypes = req.body;
    try {
      const ids = await Promise.all(
        activityTypes.map(async (activityType) => {
          const { name, toggle, emoji } = activityType;
          return await createActivityType(name, toggle, emoji);
        })
      );
      res.status(201).send(ids);
    } catch (err) {
      res.status(500).send(err.message);
    }
  } else {
    const { name, toggle, emoji } = req.body;
    try {
      const id = await createActivityType(name, toggle, emoji);
      res.status(201).send({ id });
    } catch (err) {
      res.status(500).send(err.message);
    }
  }
};

// Get all activity types from the database
export const getActivityTypes = async (req, res) => {
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
    else res.status(404).send(`Activity type with ID ${id} not found`);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Get a single activity type from the database by its ID
export const updateActivityTypeById = async (req, res) => {
  const { id } = req.params;
  const { name, toggle, emoji } = req.body;
  let newName, newToggle, newEmoji;
  let originalActivityType;

  // Return an error, if neither "name" nor "toggle" is provided in the request body
  if (!name && !toggle && !emoji) {
    return res
      .status(400)
      .send(
        "Please provide a name, toggle option, and emoji for the activity type"
      );
  }

  // Check if the activity type exists in the database
  try {
    originalActivityType = await readActivityTypeById(id);
    if (!originalActivityType)
      return res.status(404).send(`Activity type with ID ${id} not found`);
  } catch (err) {
    return;
  }

  if (!name && !emoji && toggle) {
    // Update the toggle option only
    newName = originalActivityType.name;
    newEmoji = originalActivityType.emoji;
    newToggle = toggle;
  } else if (!emoji && !toggle && name) {
    // Update the name only
    newName = name;
    newToggle = originalActivityType.toggle;
    newEmoji = originalActivityType.emoji;
  } else if (!name && !toggle && emoji) {
    // Update the emoji only
    newName = originalActivityType.name;
    newToggle = originalActivityType.toggle;
    newEmoji = emoji;
  }

  // Update the activity type in the database
  try {
    const changes = await updateActivityType(id, newName, newToggle);
    return res.status(200).send({ changes });
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

// Delete an existing activity type from the database by its ID
export const deleteActivityTypeById = async (req, res) => {
  const { id } = req.params;

  // Check if the activity type exists in the database
  try {
    const activityType = await readActivityTypeById(id);
    if (!activityType)
      return res.status(404).send(`Activity type with ID ${id} not found`);
  } catch (err) {
    return;
  }

  // Delete the activity type from the database
  try {
    const changes = await deleteActivityType(id);
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

        // Determine available menu items based on the last logged activity
        if (lastActivity) {
          // If the last activity is a start/end activity, return the opposite
          if (lastActivity.status === "start")
            return {
              name: `${activityType.emoji} End ${activityType.name}`,
            };
          else if (lastActivity.status === "end")
            return {
              name: `${activityType.emoji} Start ${activityType.name}`,
            };
          else
            return {
              name: `${activityType.emoji} ${activityType.name}`,
            };
        } else {
          // If no activity has been logged yet and the activity type is a start/end activity, return the start activity
          if (activityType.toggle)
            return {
              name: `${activityType.emoji} Start ${activityType.name}`,
            };
          // If no activity has been logged yet and the activity type is a normal activity, return the activity type name
          else
            return {
              name: `${activityType.emoji} ${activityType.name}`,
            };
        }
      })
    );

    // Remove duplicates and format the final menu items
    const uniqueMenuItems = Array.from(
      new Set(menuItems.map((item) => item.name))
    );
    res.status(200).json(uniqueMenuItems);
  } catch (err) {
    res.status(500).send(err.message);
  }
};
