import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./database.db");

// Create the "movies" table in the database
db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS movies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      watched BOOLEAN DEFAULT 0
    )`
  );
});

// CREATE a new movie in the database
export const createMovie = (title, watched) => {
  const newWatched = watched || true;

  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO movies (title, watched) VALUES (?, ?)`,
      [title, newWatched],
      function (err) {
        if (err) reject(err);

        resolve(this.lastID);
      }
    );
  });
};

// READ all movies from the database
export const readAllMovies = () => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM movies`, [], (err, rows) => {
      if (err) reject(err);

      resolve(rows);
    });
  });
};

// READ a single movie from the database by its ID
export const readMovieById = (id) => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM movies WHERE id = ?`, [id], (err, row) => {
      if (err) reject(err);

      resolve(row);
    });
  });
};

// READ a single movie from the database by its title
export const readMovieByTitle = (title) => {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT * FROM movies WHERE LOWER(title) = LOWER(?)`,
      [title],
      (err, row) => {
        if (err) reject(err);

        resolve(row);
      }
    );
  });
};

// UPDATE an existing movie in the database by its ID
export const updateMovieById = (id, title, watched) => {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE movies SET title = ?, watched = ? WHERE id = ?`,
      [title, watched, id],
      function (err) {
        if (err) reject(err);

        resolve(this.changes);
      }
    );
  });
};

// DELETE an existing movie from the database by its ID
export const deleteMovieById = (id) => {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM movies WHERE id = ?`, [id], function (err) {
      if (err) reject(err);

      resolve(this.changes);
    });
  });
};
