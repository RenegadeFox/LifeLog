import express from "express";
import {
  addGame,
  getAllGames,
  getGameById,
  getGameByName,
} from "../controllers/gameController.js";

const router = express.Router();

router.post("/", addGame);
router.get("/", getAllGames);
router.get("/:id", getGameById);
router.get("/:name", getGameByName);

export default router;
