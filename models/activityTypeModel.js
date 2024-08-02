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
      emoji TEXT
    )`
  );
});

// Create a new activity type in the database
export const createActivityType = (name, toggle = false, emoji = "") => {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO activity_types (name, toggle, emoji) VALUES (?, ?, ?)`,
      [name, toggle, emoji],
      function (err) {
        if (err) reject(err);
        resolve(this.lastID);
        console.log(`${colorize.green("Created activity type")}: "${name}"
          ${colorize.bold("ID")}: "${this.lastID}"
          ${colorize.bold("Toggle")}: "${toggle}"
          ${colorize.bold("Emoji")}: "${emoji}"`);
      }
    );
  });
};

// Update an existing activity type in the database by its ID
export const updateActivityType = (id, name, toggle, emoji) => {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE activity_types SET name = ?, toggle = ?, emoji = ? WHERE id = ?`,
      [name, toggle, emoji, id],
      function (err) {
        if (err) reject(err);
        resolve(this.changes);
        console.log(
          `${colorize.blue("Updated activity type")}: 
            ${colorize.bold("ID")}: "${id}"
            ${colorize.bold("New Name")}: "${name}"
            ${colorize.bold("New Toggle")}: "${toggle}"
            ${colorize.bold("New Emoji")}: "${emoji}"`
        );
      }
    );
  });
};

// Get all activity types from the database
export const readAllActivityTypes = () => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM activity_types`, [], (err, rows) => {
      if (err) reject(err);
      resolve(rows);
      console.log(`${colorize.magenta("Retrieved all activity types")}
        ${colorize.bold("Number of activity types")}: ${rows.length}`);
    });
  });
};

// Get a single activity type from the database by its ID
export const readActivityTypeById = (id) => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM activity_types WHERE id = ?`, [id], (err, row) => {
      if (err) reject(err);
      resolve(row);
    });
  });
};

// Delete an existing activity type from the database by its ID
export const deleteActivityType = (id) => {
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
