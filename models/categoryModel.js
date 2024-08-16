import sqlite3 from "sqlite3";
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

// CREATE a new category in the database
export const createCategory = (name) => {
  return new Promise((resolve, reject) => {
    db.run(`INSERT INTO categories (name) VALUES (?)`, [name], function (err) {
      if (err) reject(err);

      resolve(this.lastID);
    });
  });
};

// READ all categories from the database
export const readAllCategories = () => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM categories`, [], (err, rows) => {
      if (err) reject(err);

      resolve(rows);
    });
  });
};

// READ a single category from the database by its ID
export const readCategoryById = (id) => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM categories WHERE id = ?`, [id], (err, row) => {
      if (err) reject(err);

      resolve(row);
    });
  });
};

// UPDATE an existing category in the database by its ID
export const updateCategoryById = (id, name) => {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE categories SET name = ? WHERE id = ?`,
      [name, id],
      function (err) {
        if (err) reject(err);

        resolve(this.changes);
      }
    );
  });
};

// DELETE an existing category from the database by its ID
export const deleteCategoryById = (id) => {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM categories WHERE id = ?`, [id], function (err) {
      if (err) reject(err);

      resolve(this.changes);
    });
  });
};
