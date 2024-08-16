import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./database.db");

// Create the "tv_shows" table in the database
db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS tv_shows (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL
    )`
  );
});

// CREATE a new tv show in the database
export const createTvShow = (title) => {
  return new Promise((resolve, reject) => {
    db.run(`INSERT INTO tv_shows (title) VALUES (?)`, [title], function (err) {
      if (err) reject(err);

      resolve(this.lastID);
    });
  });
};

// READ all tv shows from the database
export const readAllTvShows = () => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM tv_shows`, [], (err, rows) => {
      if (err) reject(err);

      resolve(rows);
    });
  });
};

// READ a single tv show from the database by its ID
export const readTvShowById = (id) => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM tv_shows WHERE id = ?`, [id], (err, row) => {
      if (err) reject(err);

      resolve(row);
    });
  });
};

// READ a single tv show from the database by its title
export const readTvShowByTitle = (title) => {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT * FROM tv_shows WHERE LOWER(title) = LOWER(?)`,
      [title],
      (err, row) => {
        if (err) reject(err);

        resolve(row);
      }
    );
  });
};

// UPDATE an existing tv show in the database by its ID
export const updateMovieById = (id, title) => {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE tv_shows SET title = ? WHERE id = ?`,
      [title, id],
      function (err) {
        if (err) reject(err);

        resolve(this.changes);
      }
    );
  });
};

// DELETE an existing tv show from the database by its ID
export const deleteMovieById = (id) => {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM tv_shows WHERE id = ?`, [id], function (err) {
      if (err) reject(err);

      resolve(this.changes);
    });
  });
};
