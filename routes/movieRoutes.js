import express from "express";
import {
  addMovie,
  getAllMovies,
  getMovieById,
  getMovieByTitle,
  editMovieById,
  removeMovieById,
} from "../controllers/movieController.js";

const router = express.Router();

// All routes start with http://${URL}/movies

router.post("/", addMovie); // CREATE a new movie
router.get("/", getAllMovies); // READ all movies
router.get("/:id", getMovieById); // READ a single movie by ID
router.get("/bytitle/:title", getMovieByTitle); // READ a single movie by title
router.put("/:id", editMovieById); // UPDATE a movie by ID
router.delete("/:id", removeMovieById); // DELETE a movie by ID

export default router;
