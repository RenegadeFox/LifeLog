import sqlite3 from "sqlite3";
import { colorize } from "../helpers/colors.js";
const db = new sqlite3.Database("./database.db");

// Create the categories table in the database
db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    )`
  );
});

// Create a new category in the database
export const createCategory = (name) => {
  return new Promise((resolve, reject) => {
    db.run(`INSERT INTO categories (name) VALUES (?)`, [name], function (err) {
      if (err) reject(err);

      resolve(this.lastID);

      console.log(`${colorize.green("Created category")}: "${name}"
          ${colorize.bold("ID")}: "${this.lastID}"`);
    });
  });
};

// Get all categories from the database
export const readAllCategories = () => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM categories`, [], (err, rows) => {
      if (err) reject(err);

      resolve(rows);

      console.log(`${colorize.magenta("Retrieved all categories")}
        ${colorize.bold("Number of categories")}: ${rows.length}`);
    });
  });
};

// Get a single category from the database by its ID
export const readCategoryById = (id) => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM categories WHERE id = ?`, [id], (err, row) => {
      if (err) reject(err);

      resolve(row);
    });
  });
};

// Update an existing category in the database by its ID
export const updateCategoryById = (id, name) => {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE categories SET name = ? WHERE id = ?`,
      [name, id],
      function (err) {
        if (err) reject(err);

        resolve(this.changes);

        console.log(
          `${colorize.blue("Updated category")}: 
            ${colorize.bold("ID")}: "${id}"
            ${colorize.bold("New Name")}: "${name}"`
        );
      }
    );
  });
};

// Delete an existing category from the database by its ID
export const deleteCategoryById = (id) => {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM categories WHERE id = ?`, [id], function (err) {
      if (err) reject(err);

      resolve(this.changes);

      console.log(
        `${colorize.red("Deleted category")}: ${colorize.bold("ID")}: "${id}"`
      );
    });
  });
};
