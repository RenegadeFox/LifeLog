import {
  createActivity,
  readAllActivities,
  readActivitiesWithPagination,
  readActivitiesByTypeWithPagination,
  readActivityById,
  updateActivityById,
  deleteActivityById,
} from "../models/activityModel.js";

// ADD an activity in the database
export const addActivity = async (req, res) => {
  const { type_id, status, description, timestamp } = req.body;
  const newStatus = status || "none";

  if (!type_id) return res.status(400).send("Missing type_id");

  // Convert the ISO 8601 timestamp to a Unix timestamp
  const date = new Date(timestamp);
  const unixTimestamp = date.getTime() / 1000;

  try {
    const newActivityId = await createActivity(
      type_id,
      newStatus,
      description,
      unixTimestamp
    );

    res.status(201).send({ newActivityId });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// GET all activities from the database
export const getAllActivities = async (req, res) => {
  try {
    const allActivities = await readAllActivities();

    res.status(200).json(allActivities || []);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// GET paginated activities from the database
export const getPaginatedActivities = async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const page = parseInt(req.query.page, 10) || 1;
  const offset = (page - 1) * limit;

  try {
    const rows = await readActivitiesWithPagination(limit, offset);
    const formattedRows = rows.map((row) => {
      let label = "";
      if (row.status === "none") label = row.activity_type;
      else if (row.status === "started") label = row.start_label;
      else if (row.status === "not-started") label = row.end_label;

      return {
        id: row.id,
        emoji: row.emoji,
        label: label,
        activity: row.activity_type,
        type_id: row.type_id,
        status: row.status,
        description: row.description,
        timestamp: `${new Date(row.timestamp * 1000).toISOString()}`,
        category: row.category || "Uncategorized",
        category_id: row.category_id,
      };
    });
    res.status(200).json(formattedRows || []);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// GET all activities of a specific type with pagination from the database
export const getActivitiesByTypeWithPagination = async (req, res) => {
  const { type_id } = req.params;
  const limit = parseInt(req.query.limit, 10) || 10;
  const page = parseInt(req.query.page, 10) || 1;
  const start_date = req.query.start_date || undefined;
  const end_date = req.query.end_date || undefined;
  const offset = (page - 1) * limit;

  try {
    const rows = await readActivitiesByTypeWithPagination(
      type_id,
      limit,
      offset,
      start_date,
      end_date
    );
    const formattedRows = rows.map((row) => {
      let label = "";
      if (row.status === "none") label = row.activity_type;
      else if (row.status === "started") label = row.start_label;
      else if (row.status === "not-started") label = row.end_label;

      return {
        id: row.id,
        label: label,
        activity: row.activity_type,
        status: row.status,
        description: row.description,
        timestamp: `${new Date(row.timestamp * 1000).toISOString()}`,
        category: row.category || "Uncategorized",
      };
    });
    res.status(200).json(formattedRows || []);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// GET a single activity from the database by its ID
export const getActivityById = async (req, res) => {
  const { id } = req.params;

  try {
    const activity = await readActivityById(id);
    if (!activity) return res.status(404).send("Activity not found");

    res.status(200).json(activity);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// EDIT an existing activity in the database by its ID
export const editActivityById = async (req, res) => {
  const { id } = req.params;
  const { type_id, status, description, timestamp } = req.body;

  try {
    // Check if the activity exists before updating it
    const activity = await readActivityById(id);
    if (!activity) return res.status(404).send("Activity not found");

    const newType_id = type_id || activity.type_id;
    const newStatus = status || activity.status;
    const newDescription = description || activity.description;
    const newTimestamp =
      new Date(timestamp).getTime() / 1000 || activity.timestamp;

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

// DELETE an existing activity in the database by its ID
export const removeActivityById = async (req, res) => {
  const { id } = req.params;

  try {
    const activity = await readActivityById(id);
    if (!activity) return res.status(404).send("Activity not found");

    const changes = await deleteActivityById(id);

    res.status(200).send({ changes });
  } catch (err) {
    res.status(500).send(err.message);
  }
};
