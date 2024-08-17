import {
  createActivityType,
  readAllActivityTypes,
  updateActivityTypeById,
  readActivityTypeById,
  deleteActivityTypeById,
} from "../models/activityTypeModel.js";

// ADD a new activity type in the database
export const addActivityType = async (req, res) => {
  const isMultiple = Array.isArray(req.body);

  if (isMultiple) {
    // Request body is an array of activity types to be added to the database
    const activityTypesToAdd = req.body;
    try {
      const createdActivityTypeIds = await Promise.all(
        activityTypesToAdd.map(async (activityType) => {
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
      res.status(201).send(createdActivityTypeIds);
    } catch (err) {
      res.status(500).send(err.message);
    }
  } else {
    // Request body is a single activity type to be added to the database
    const { name, toggle, start_label, end_label, category_id } = req.body;

    if (!name) return res.status(400).send("Missing name");

    try {
      const id = await createActivityType(
        name,
        toggle,
        start_label,
        end_label,
        category_id
      );

      // TODO: Add a check to see if the activity type already exists in the database

      res.status(201).send({ id });
    } catch (err) {
      res.status(500).send(err.message);
    }
  }
};

// GET all activity types from the database
export const getAllActivityTypes = async (req, res) => {
  try {
    const allActivityTypes = await readAllActivityTypes();

    res.status(200).json(allActivityTypes || []);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// GET a single activity type from the database by its ID
export const getActivityTypeById = async (req, res) => {
  const { id } = req.params;

  try {
    const activityType = await readActivityTypeById(id);

    if (!activityType)
      return res.status(404).send(`Activity type with ID "${id}" not found`);

    return res.status(200).json(activityType);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// EDIT a single activity type from the database by its ID
export const editActivityTypeById = async (req, res) => {
  const { id } = req.params;
  const { name, toggle, start_label, end_label, category_id } = req.body;

  // Check if no fields are provided in the request body
  if (!name && !toggle && !start_label && !end_label && !category_id)
    return res.status(400).send("No fields provided");

  // Update the activity type in the database
  try {
    const oldActivityType = await readActivityTypeById(id);
    if (!oldActivityType)
      return res.status(404).send(`Activity type with ID "${id}" not found`);

    // Only update the fields that are provided in the request body
    const newName = name || oldActivityType.name;
    const newToggle = toggle || oldActivityType.toggle;
    const newStartLabel = start_label || oldActivityType.start_label;
    const newEndLabel = end_label || oldActivityType.end_label;
    const newCategoryId = category_id || oldActivityType.category_id;

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

// REMOVE an existing activity type from the database by its ID
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
