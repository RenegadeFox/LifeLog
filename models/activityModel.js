import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./database.db");

// Create the "activities" table in the database
db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type_id INTEGER,
      status TEXT DEFAULT "none",
      description TEXT,
      timestamp INTEGER,
      FOREIGN KEY(type_id) REFERENCES activity_types(id)
    )`
  );
});

// CREATE a new activity in the database
export const createActivity = (type_id, status, description, timestamp) => {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO activities (type_id, status, description, timestamp) VALUES (?, ?, ?, ?)`,
      [type_id, status, description, timestamp],
      function (err) {
        if (err) reject(err);
        resolve(this.lastID);
      }
    );
  });
};

// READ all activities from the database
export const readAllActivities = () => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM activities`, (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });
};

// READ a single activity from the database by its ID
export const readActivityById = (id) => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM activities WHERE id = ?`, [id], (err, row) => {
      if (err) reject(err);
      resolve(row);
    });
  });
};

// READ the last activity of a specific activity_type from the database
export const readLastActivityByType = (type_id) => {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT
        activities.id,
        activity_types.name AS activity_type,
        activities.status,
        activities.description,
        timestamp,
        categories.name AS category
      FROM activities
      JOIN activity_types ON activities.type_id = activity_types.id
      JOIN categories ON activity_types.category_id = categories.id
      WHERE type_id = ? ORDER BY timestamp DESC LIMIT 1`,
      [type_id],
      (err, row) => {
        if (err) reject(err);

        resolve(row);
      }
    );
  });
};

// READ all activities with pagination and limiting the number of results
export const readActivitiesWithPagination = (limit, offset) => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT
        activities.id,
        activities.description,
        activities.timestamp,
        activities.status,
        activity_types.name AS activity_type,
        activity_types.start_label AS start_label,
        activity_types.end_label AS end_label,
        categories.name AS category
      FROM activities
      JOIN activity_types ON activities.type_id = activity_types.id
      JOIN categories ON activity_types.category_id = categories.id
      ORDER BY activities.timestamp DESC
      LIMIT ? OFFSET ?`,
      [limit, offset],
      (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      }
    );
  });
};

// READ all activities of a specific activity_type with pagination and limiting the number of results
export const readActivitiesByTypeWithPagination = (type_id, limit, offset) => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT
        activities.id,
        activities.description,
        activities.timestamp,
        activities.status,
        activity_types.name AS activity_type,
        activity_types.start_label AS start_label,
        activity_types.end_label AS end_label,
        categories.name AS category
      FROM activities
      JOIN activity_types ON activities.type_id = activity_types.id
      JOIN categories ON activity_types.category_id = categories.id
      WHERE type_id = ?
      ORDER BY activities.timestamp DESC
      LIMIT ? OFFSET ?`,
      [type_id, limit, offset],
      (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      }
    );
  });
};

// UPDATE an existing activity in the database by its ID
export const updateActivityById = (
  id,
  type_id,
  status,
  description,
  timestamp
) => {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE activities SET type_id = ?, status = ?, description = ?, timestamp = ? WHERE id = ?`,
      [type_id, status, description, timestamp, id],
      function (err) {
        if (err) reject(err);

        resolve(this.changes);
      }
    );
  });
};

// DELETE an activity from the database by its ID
export const deleteActivityById = (id) => {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM activities WHERE id = ?`, id, function (err) {
      if (err) reject(err);
      resolve(this.changes);
    });
  });
};
