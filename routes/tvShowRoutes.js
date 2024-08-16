import express from "express";
import {
  addTvShow,
  getAllTvShows,
  getTvShowById,
  getTvShowByTitle,
  editTvShowById,
  removeTvShowById,
} from "../controllers/tvShowController.js";

const router = express.Router();

// All routes start with http://${URL}/tv-shows

router.post("/", addTvShow); // CREATE a new TV show
router.get("/", getAllTvShows); // READ all TV shows
router.get("/:id", getTvShowById); // READ a single TV show by ID
router.get("/bytitle/:title", getTvShowByTitle); // READ a single TV show by title
router.put("/:id", editTvShowById); // UPDATE a TV show by ID
router.delete("/:id", removeTvShowById); // DELETE a TV show by ID

export default router;
