import sqlite3 from "sqlite3";
import { colorize } from "../helpers/colors.js";
const db = new sqlite3.Database("./database.db");

db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS games (id INTEGER PRIMARY KEY, name TEXT)"
  );
});

// Add a new game to the database that can be logged
export const createGame = (newGameName) => {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO games (name) VALUES (?)",
      [newGameName],
      function (err) {
        if (err) reject(err);
        resolve(this.lastID);
        console.log(
          `${colorize.green("Created game")}:
          ${colorize.bold("ID")}: "${this.lastID}"
          ${colorize.bold("Name")}: ${newGameName}`
        );
      }
    );
  });
};

// Get all games from the database
export const readAllGames = () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM games", [], (err, rows) => {
      if (err) reject(err);
      resolve(rows);
      console.log(`${colorize.magenta("Retrieved all games")}
        ${colorize.bold("Number of games")}: ${rows.length}`);
    });
  });
};

// Get a single game from the database by its ID
export const readGameById = (id) => {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM games WHERE id = ?", [id], (err, row) => {
      if (err) reject(err);
      resolve(row);
      console.log(`${colorize.magenta(`Retrieved game by ID: ${row.name}`)}`);
    });
  });
};

// Get a single game from the database by it's name
export const readGameByName = (name) => {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM games WHERE name = ?", [name], (err, row) => {
      if (err) reject(err);
      resolve(row);
      console.log(`${colorize.magenta(`Retrieved game by name: ${name}`)}`);
    });
  });
};

// Update an existing game in the database by its ID
export const updateGameById = (id, newName) => {
  return new Promise((resolve, reject) => {
    db.run(
      "UPDATE games SET name = ? WHERE id = ?",
      [newName, id],
      function (err) {
        if (err) reject(err);

        resolve(this.changes);

        console.log(
          `${colorize.green("Updated game")}:
          ${colorize.bold("ID")}: "${id}"
          ${colorize.bold("New name")}: ${newName}`
        );
      }
    );
  });
};

// Delete an existing game from the database by its ID
export const deleteGameById = (id) => {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM games WHERE id = ?", [id], function (err) {
      if (err) reject(err);

      resolve(this.changes);

      console.log(
        `${colorize.red("Deleted game")}:
        ${colorize.bold("ID")}: "${id}"`
      );
    });
  });
};
