import {
  createActivity,
  readAllActivities,
  readActivitiesWithPagination,
  readActivityById,
  updateActivityById,
  deleteActivityById,
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
export const getAllActivities = async (req, res) => {
  try {
    const allActivities = await readAllActivities();
    res.status(200).json(allActivities || []);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Get paginated activities from the database
export const getPaginatedActivities = async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const page = parseInt(req.query.page, 10) || 1;
  const offset = (page - 1) * limit;

  try {
    const rows = await readActivitiesWithPagination(limit, offset);
    const formattedRows = rows.map((row) => {
      let label = "";
      if (row.status === "none") label = row.activity_type;
      else if (row.status === "start") label = row.start_label;
      else if (row.status === "end") label = row.end_label;

      return {
        id: row.id,
        label: label,
        activity: row.activity_type,
        status: row.status,
        description: row.description,
        timestamp: new Date(row.timestamp * 1000).toISOString(),
      };
    });
    res.status(200).json(formattedRows || []);
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
export const editActivityById = async (req, res) => {
  const { id } = req.params;
  const { type_id, status, description, timestamp } = req.body;
  let newType_id, newStatus, newDescription, newTimestamp;

  try {
    // Check if the activity exists before updating it
    const activity = await readActivityById(id);
    if (!activity) {
      return res.status(404).send("Activity not found");
    } else {
      newType_id = type_id || activity.type_id;
      newStatus = status || activity.status;
      newDescription = description || activity.description;
      newTimestamp = new Date(timestamp).getTime() / 1000 || activity.timestamp;
    }

    const changes = await updateActivityById(
      id,
      newType_id,
      newStatus,
      newDescription,
      newTimestamp
    );
    res.status(200).send({ changes });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Delete an existing activity in the database by its ID
export const removeActivityById = async (req, res) => {
  const { id } = req.params;

  try {
    const activity = await readActivityById(id);
    if (!activity) return res.status(404).send("Activity not found");
  } catch (err) {
    return;
  }

  try {
    const changes = await deleteActivityById(id);
    res.status(200).send({ changes });
  } catch (err) {
    res.status(500).send(err.message);
  }
};
