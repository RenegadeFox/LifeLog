import {
  createGame,
  readAllGames,
  readGameById,
  readGameByName,
  updateGameById,
  deleteGameById,
} from "../models/gameModel.js";

// ADD a new game to the database
export const addGame = async (req, res) => {
  const { name } = req.body;

  try {
    // Check if the game is already in the database
    const game = await readGameByName(name);

    // If the game already exists, return a 409 Conflict status
    if (game) return res.status(409).send(`Game "${name}" already exists`);

    const newGameId = await createGame(name);

    res.status(201).send({ newGameId });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// GET all games from the database
export const getAllGames = async (req, res) => {
  try {
    const allGames = await readAllGames();

    if (allGames) return res.status(200).json(allGames);
    else return res.status(204).json([]);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// GET a single game from the database by its ID
export const getGameById = async (req, res) => {
  const { id } = req.params;

  try {
    const game = await readGameById(id);

    if (!game) return res.status(404).send(`Game with ID "${id}" not found`);

    res.status(200).json(game);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// GET a single game from the database by its name
export const getGameByName = async (req, res) => {
  const { name } = req.params;

  try {
    const game = await readGameByName(name);

    if (!game) return res.status(404).send(`Game "${name}" not found`);

    res.status(200).json(game);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// EDIT an existing game in the database by its ID
export const editGameById = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  // Ensure we have a name before proceeding
  if (!name) return res.status(400).send("Missing name");

  try {
    // Check if the game exists before updating it
    const oldGame = await readGameById(id);
    if (!oldGame) return res.status(404).send(`Game with ID "${id}" not found`);

    // Check if another game with the same name already exists
    const existingGame = await readGameByName(name);
    if (existingGame)
      return res.status(409).send(`Game "${name}" already exists.`);

    // Update the game in the database
    const changes = await updateGameById(id, name);

    res.status(200).send({ changes });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// REMOVE an existing game from the database by its ID
export const removeGameById = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the game exists before deleting it
    const gameToRemove = await readGameById(id);
    if (!gameToRemove)
      return res.status(404).send(`Game with ID "${id}" not found`);

    // Delete the game from the database
    const changes = await deleteGameById(id);

    res.status(200).send({ changes });
  } catch (err) {
    res.status(500).send(err.message);
  }
};
