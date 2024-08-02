import {
  createActivity,
  updateActivity,
  deleteActivity,
  readAllActivities,
  readActivityById,
} from "../models/activityModel.js";

// Log an activity in the database
export const logActivity = async (req, res) => {
  const { type_id, status, description, timestamp } = req.body;

  // Convert the ISO 8601 timestamp to a Unix timestamp
  const date = new Date(timestamp);
  const unixTimestamp = date.getTime() / 1000;

  try {
    const id = await createActivity(
      type_id,
      status || "none",
      description,
      unixTimestamp
    );
    res.status(201).send({ id });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Get all activities from the database
export const getActivities = async (req, res) => {
  try {
    const allActivities = await readAllActivities();
    res.status(200).json(allActivities || []);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Get a single activity from the database by its ID
export const getActivityById = async (req, res) => {
  const { id } = req.params;

  try {
    const activity = await readActivityById(id);
    if (activity) return res.status(200).json(activity);
    res.status(404).send("Activity not found");
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Update an existing activity in the database by its ID
export const updateActivityById = async (req, res) => {
  const { id } = req.params;
  const { type_id, status, description, timestamp } = req.body;

  // Check if the activity exists in the database
  try {
    const activity = await readActivityById(id);
    if (!activity) return res.status(404).send("Activity not found");
  } catch (err) {
    return;
  }

  try {
    const changes = await updateActivity(
      id,
      type_id,
      status,
      description,
      timestamp
    );
    res.status(200).send({ changes });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Delete an existing activity in the database by its ID
export const deleteActivityById = async (req, res) => {
  const { id } = req.params;

  try {
    const activity = await readActivityById(id);
    if (!activity) return res.status(404).send("Activity not found");
  } catch (err) {
    return;
  }

  try {
    const changes = await deleteActivity(id);
    res.status(200).send({ changes });
  } catch (err) {
    res.status(500).send(err.message);
  }
};
