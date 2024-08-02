import {
  createActivityType,
  readAllActivityTypes,
  updateActivityType,
  readActivityTypeById,
  deleteActivityType,
} from "../models/activityTypeModel.js";
import { readLastActivityByType } from "../models/activityModel.js";
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
          const { name, toggle, start_label, end_label } = activityType;
          return await createActivityType(name, toggle, start_label, end_label);
        })
      );
      res.status(201).send(ids);
    } catch (err) {
      res.status(500).send(err.message);
    }
  } else {
    const { name, toggle, start_label, end_label } = req.body;
    try {
      const id = await createActivityType(name, toggle, start_label, end_label);
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
  const { name, toggle, start_label, end_label } = req.body;
  let newName, newToggle, newStartLabel, newEndLabel;
  let originalActivityType;

  // Return an error, if neither "name" nor "toggle" is provided in the request body
  if (!name && !toggle && !startLabel && !end_label) {
    return res
      .status(400)
      .send(
        "Please provide a name, toggle option, start_label, and endLabel for the activity type"
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

  // Only update the fields that are provided in the request body
  newName = name || originalActivityType.name;
  newToggle = toggle || originalActivityType.toggle;
  newStartLabel = start_label || originalActivityType.start_label;
  newEndLabel = end_label || originalActivityType.end_label;

  // Update the activity type in the database
  try {
    const changes = await updateActivityType(
      id,
      newName,
      newToggle,
      newStartLabel,
      newEndLabel
    );
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
