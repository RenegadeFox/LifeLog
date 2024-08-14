import express from "express";
import {
  addGame,
  getAllGames,
  getGameById,
  getGameByName,
  editGameById,
  removeGameById,
} from "../controllers/gameController.js";

const router = express.Router();

router.post("/", addGame); // CREATE a new game
router.get("/", getAllGames); // READ all games
router.get("/:id", getGameById); // READ a single game by ID
router.get("/:name", getGameByName); // READ a single game by name
router.put("/:id", editGameById); // UPDATE a game by ID
router.delete("/:id", removeGameById); // DELETE a game by ID

export default router;
