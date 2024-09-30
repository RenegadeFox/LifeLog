import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./database.db");

// Create the activity_types table in the database
db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS activity_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      toggle BOOLEAN DEFAULT 0,
      start_label TEXT,
      end_label TEXT,
      category_id INTEGER,
      FOREIGN KEY(category_id) REFERENCES categories(id)
    )`
  );
});

// CREATE a new activity type in the database
export const createActivityType = (
  name,
  toggle,
  startLabel,
  endLabel,
  categoryId,
  emoji
) => {
  const newToggle = toggle || 0;
  const newStartLabel = startLabel || "";
  const newEndLabel = endLabel || "";
  const newCategoryId = categoryId || 2; // Default to 2 for "Uncategorized"
  const newEmoji = emoji || "❓";

  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO activity_types (name, toggle, start_label, end_label, category_id, emoji) VALUES (?, ?, ?, ?, ?, ?)`,
      [name, newToggle, newStartLabel, newEndLabel, newCategoryId, newEmoji],
      function (err) {
        if (err) reject(err);

        resolve(this.lastID);
      }
    );
  });
};

// READ all activity types from the database
export const readAllActivityTypes = () => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT 
        activity_types.id,
        activity_types.name,
        activity_types.toggle,
        activity_types.start_label,
        activity_types.end_label,
        categories.name AS category,
        categories.id AS category_id,
        activity_types.emoji AS emoji
      FROM activity_types
      JOIN categories ON activity_types.category_id = categories.id`,
      [],
      (err, rows) => {
        if (err) reject(err);

        resolve(rows);
      }
    );
  });
};

// READ all activity types based on the category_id from the database
export const readActivityTypesByCategory = (category_id) => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT 
        activity_types.id,
        activity_types.name,
        activity_types.toggle,
        activity_types.start_label,
        activity_types.end_label,
        categories.name AS category,
        categories.id AS category_id,
        activity_types.emoji AS emoji
      FROM activity_types
      JOIN categories ON activity_types.category_id = categories.id
      WHERE category_id = ?`,
      [category_id],
      (err, rows) => {
        if (err) reject(err);

        resolve(rows);
      }
    );
  });
};

// READ a single activity type from the database by its ID
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
      WHERE activity_types.id = ?`,
      [id],
      (err, row) => {
        if (err) reject(err);

        resolve(row);
      }
    );
  });
};

// UPDATE an existing activity type in the database by its ID
export const updateActivityTypeById = (
  id,
  name,
  toggle,
  startLabel,
  endLabel,
  categoryId,
  emoji
) => {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE activity_types SET name = ?, toggle = ?, start_label = ?, end_label = ?, category_id = ?, emoji = ? WHERE id = ?`,
      [name, toggle, startLabel, endLabel, categoryId, emoji, id],
      function (err) {
        if (err) reject(err);

        resolve(this.changes);
      }
    );
  });
};

// DELETE an existing activity type from the database by its ID
export const deleteActivityTypeById = (id) => {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM activity_types WHERE id = ?`, [id], function (err) {
      if (err) reject(err);

      resolve(this.changes);
    });
  });
};
