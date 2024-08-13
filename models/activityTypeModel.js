import sqlite3 from "sqlite3";
import { colorize } from "../helpers/colors.js";
const db = new sqlite3.Database("./database.db");

// Create the activity_types table in the database
db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS activity_types (
      id INTEGER PRIMARY KEY,
      name TEXT,
      toggle BOOLEAN DEFAULT 0,
      start_label TEXT,
      end_label TEXT,
      category_id INTEGER,
    )`
  );
});

// Create a new activity type in the database
export const createActivityType = (
  name,
  toggle,
  startLabel,
  endLabel,
  categoryId
) => {
  const newToggle = toggle || 0;
  const newStartLabel = startLabel || "";
  const newEndLabel = endLabel || "";
  const newCategoryId = categoryId || 0;

  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO activity_types (name, toggle, start_label, end_label, category_id) VALUES (?, ?, ?, ?, ?)`,
      [name, newToggle, newStartLabel, newEndLabel, newCategoryId],
      function (err) {
        if (err) reject(err);

        resolve(this.lastID);

        console.log(`${colorize.green("Created activity type")}: "${name}"
          ${colorize.bold("ID")}: "${this.lastID}"
          ${colorize.bold("Toggle")}: "${newToggle}"
          ${colorize.bold("Start Label")}: "${newStartLabel}"
          ${colorize.bold("End Label")}: "${newEndLabel}"
          ${colorize.bold("Category ID")}: "${newCategoryId}"`);
      }
    );
  });
};

// Get all activity types from the database
export const readAllActivityTypes = () => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT 
        activity_types.id,
        activity_types.name,
        activity_types.toggle,
        activity_types.start_label,
        activity_types.end_label,
        categories.name as category
      FROM activity_types
      JOIN categories ON activity_types.category_id = categories.id`,
      [],
      (err, rows) => {
        if (err) reject(err);

        resolve(rows);

        console.log(`${colorize.magenta("Retrieved all activity types")}
        ${colorize.bold("Number of activity types")}: ${rows.length}`);
      }
    );
  });
};

// Get a single activity type from the database by its ID
export const readActivityTypeById = (id) => {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT 
        activity_types.id,
        activity_types.name,
        activity_types.toggle,
        activity_types.start_label,
        activity_types.end_label,
        categories.name as category
      FROM activity_types
      JOIN categories ON activity_types.category_id = categories.id
      WHERE id = ?`,
      [id],
      (err, row) => {
        if (err) reject(err);

        resolve(row);
      }
    );
  });
};

// Update an existing activity type in the database by its ID
export const updateActivityTypeById = (
  id,
  name,
  toggle,
  startLabel,
  endLabel,
  categoryId
) => {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE activity_types SET name = ?, toggle = ?, start_label = ?, end_label = ?, category_id = ? WHERE id = ?`,
      [name, toggle, startLabel, endLabel, categoryId, id],
      function (err) {
        if (err) reject(err);

        resolve(this.changes);

        console.log(
          `${colorize.blue("Updated activity type")}: 
            ${colorize.bold("ID")}: "${id}"
            ${colorize.bold("New Name")}: "${name}"
            ${colorize.bold("New Toggle")}: "${toggle}"
            ${colorize.bold("New Start Label")}: "${startLabel}"
            ${colorize.bold("New End Label")}: "${endLabel}"
            ${colorize.bold("New Category ID")}: "${categoryId}"`
        );
      }
    );
  });
};

// Delete an existing activity type from the database by its ID
export const deleteActivityTypeById = (id) => {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM activity_types WHERE id = ?`, [id], function (err) {
      if (err) reject(err);

      resolve(this.changes);

      console.log(
        `${colorize.red("Deleted activity type")}: ${colorize.bold(
          "ID"
        )}: "${id}"`
      );
    });
  });
};
