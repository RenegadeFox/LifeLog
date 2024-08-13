import sqlite3 from "sqlite3";
import { colorize } from "../helpers/colors.js";
const db = new sqlite3.Database("./database.db");

// Create the activities table in the database
db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY,
      type_id INTEGER,
      status TEXT DEFAULT "none",
      description TEXT,
      timestamp INTEGER,
      FOREIGN KEY(type_id) REFERENCES activity_types(id)
    )`
  );
});

// Log a new activity in the database
export const createActivity = (type_id, status, description, timestamp) => {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO activities (type_id, status, description, timestamp) VALUES (?, ?, ?, ?)`,
      [type_id, status, description, timestamp],
      function (err) {
        if (err) reject(err);
        resolve(this.lastID);
        console.log(
          `${colorize.green("Logged activity")}:
            ${colorize.bold("Type ID")}: "${type_id}"
            ${colorize.bold("Description")}: ${description}
            ${colorize.bold("Status")}: ${status}
            ${colorize.bold("Timestamp")}: ${new Date(
            timestamp * 1000
          ).toISOString()}`
        );
      }
    );
  });
};

// Get all activities from the database
export const readAllActivities = () => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM activities`, (err, rows) => {
      if (err) reject(err);
      resolve(rows);
      console.log(`${colorize.magenta("Retrieved all activities")}
        ${colorize.bold("Number of activities")}: ${rows.length}`);
    });
  });
};

// Get a single activity from the database by its ID
export const readActivityById = (id) => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM activities WHERE id = ?`, [id], (err, row) => {
      if (err) reject(err);
      resolve(row);
    });
  });
};

// Get the last activity of a specific type from the database
export const readLastActivityByType = (type_id) => {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT id, type_id, status, description, timestamp FROM activities WHERE type_id = ? ORDER BY timestamp DESC LIMIT 1`,
      [type_id],
      (err, row) => {
        if (err) reject(err);

        resolve(row);
      }
    );
  });
};

// Read all activities with pagination and limiting the number of results
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
        console.log(`${colorize.magenta(
          "Retrieved all activities with pagination"
        )}
        ${colorize.bold("Number of activities")}: ${rows.length}`);
      }
    );
  });
};

// Update an existing activity in the database by its ID
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

        console.log(
          `${colorize.blue("Updated activity")}: ${colorize.bold("ID")}: "${id}"
            ${colorize.bold("New Value")}: 
              ${colorize.bold("Type ID")}: "${type_id}"
              ${colorize.bold("Description")}: "${description}"
              ${colorize.bold("Status")}: "${status}"
              ${colorize.bold("Timestamp")}: "${new Date(
            timestamp * 1000
          ).toISOString()}"`
        );
      }
    );
  });
};

// Delete an activity from the database by its ID
export const deleteActivityById = (id) => {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM activities WHERE id = ?`, id, function (err) {
      if (err) reject(err);
      resolve(this.changes);
      console.log(
        `${colorize.red("Deleted activity")}: ${colorize.bold("ID")}: "${id}"`
      );
    });
  });
};
