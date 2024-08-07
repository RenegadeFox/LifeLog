import {
  createGame,
  readAllGames,
  readGameByName,
} from "../models/gameModel.js";

// Add a new game to the database
export const addGame = async (req, res) => {
  const { name } = req.body;

  try {
    // Check if the game is already in the database
    const game = await readGameByName(name);

    if (game) {
      return res.status(409).send("Game already exists");
    }

    const id = await createGame(name);
    res.status(201).send({ id });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Get all games from the database
export const getAllGames = async (req, res) => {
  try {
    const rows = await readAllGames();
    res.status(200).json({
      games: rows.map((row) => row.name),
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Get a single game from the database by its ID
export const getGameById = async (req, res) => {
  const { id } = req.params;

  try {
    const row = await readGameById(id);

    if (!row) {
      return res.status(404).send("Game not found");
    }

    res.status(200).json(row);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Get a single game from the database by its name
export const getGameByName = async (req, res) => {
  const { name } = req.params;

  try {
    const row = await readGameByName(name);

    if (!row) {
      return res.status(404).send("Game not found");
    }

    res.status(200).json(row);
  } catch (err) {
    res.status(500).send(err.message);
  }
};
