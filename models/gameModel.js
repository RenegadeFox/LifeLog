import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./database.db");

db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS games (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)"
  );
});

// CREATE a new game to the database that can be logged
export const createGame = (newGameName) => {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO games (name) VALUES (?)",
      [newGameName],
      function (err) {
        if (err) reject(err);

        resolve(this.lastID);
      }
    );
  });
};

// READ all games from the database
export const readAllGames = () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM games", [], (err, rows) => {
      if (err) reject(err);

      resolve(rows);
    });
  });
};

// READ a single game from the database by its ID
export const readGameById = (id) => {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM games WHERE id = ?", [id], (err, row) => {
      if (err) reject(err);

      resolve(row);
    });
  });
};

// READ a single game from the database by it's name
export const readGameByName = (name) => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM games WHERE LOWER(name) = LOWER(?)",
      [name],
      (err, row) => {
        if (err) reject(err);

        resolve(row);
      }
    );
  });
};

// UPDATE an existing game in the database by its ID
export const updateGameById = (id, newName) => {
  return new Promise((resolve, reject) => {
    db.run(
      "UPDATE games SET name = ? WHERE id = ?",
      [newName, id],
      function (err) {
        if (err) reject(err);

        resolve(this.changes);
      }
    );
  });
};

// DELETE an existing game from the database by its ID
export const deleteGameById = (id) => {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM games WHERE id = ?", [id], function (err) {
      if (err) reject(err);

      resolve(this.changes);
    });
  });
};
