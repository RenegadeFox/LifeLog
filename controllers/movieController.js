import {
  createMovie,
  readAllMovies,
  readMovieById,
  readMovieByTitle,
  updateMovieById,
  deleteMovieById,
} from "../models/movieModel.js";

// ADD a new movie in the database
export const addMovie = async (req, res) => {
  const isMultiple = Array.isArray(req.body);

  if (isMultiple) {
    // Request body is an array of movies to be added to the database
    const moviesToAdd = req.body;
    const moviesWithIssues = [];
    try {
      const movieIds = await Promise.all(
        moviesToAdd.map(async (movie) => {
          const { title, watched } = movie;

          if (!title) {
            moviesWithIssues.push({ movie, issue: "missing title" });
            return;
          }

          const existingMovie = await readMovieByTitle(title);
          if (existingMovie) {
            moviesWithIssues.push({ movie: title, issue: "already exists" });
            return;
          }

          return await createMovie(title, watched);
        })
      );

      if (moviesWithIssues.length > 0)
        return res.status(409).send(moviesWithIssues);

      return res.status(201).send(movieIds);
    } catch (err) {
      res.status(500).send(err.message);
    }
  } else {
    // Request body is a single movie to be added to the database
    const { title, watched } = req.body;
    const newWatched = watched || true;

    if (!title) return res.status(400).send("Missing title");

    try {
      const movie = await readMovieByTitle(title);
      if (movie) return res.status(409).send(`Movie "${title}" already exists`);

      const movieId = await createMovie(title, newWatched);

      res.status(201).send({ movieId });
    } catch (err) {
      res.status(500).send(err.message);
    }
  }
};

// GET all movies from the database
export const getAllMovies = async (req, res) => {
  try {
    const allMovies = await readAllMovies();

    if (allMovies) return res.status(200).json(allMovies);
    else return res.status(204).json([]);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// GET a single movie from the database by its ID
export const getMovieById = async (req, res) => {
  const { id } = req.params;

  try {
    const movie = await readMovieById(id);

    if (!movie) return res.status(404).send(`Movie with ID "${id}" not found`);

    return res.status(200).json(movie);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// GET a single movie from the database by its title
export const getMovieByTitle = async (req, res) => {
  const { title } = req.params;

  try {
    const movie = await readMovieByTitle(title);

    if (!movie) return res.status(404).send(`Movie "${title}" not found`);

    return res.status(200).json(movie);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// EDIT a single movie from the database by its ID
export const editMovieById = async (req, res) => {
  const { id } = req.params;
  const { title, watched } = req.body;

  // Ensure we have a "title" or "watched" value
  if (!title && !watched)
    return res
      .status(400)
      .send(`"title" or "watched" is required but both were missing.`);

  try {
    // Check if the movie exists before updating it
    const oldMovie = await readMovieById(id);
    if (!oldMovie)
      return res.status(404).send(`Movie with ID "${id}" not found`);

    // Check if another movie with the same title already exists
    const existingMovie = await readMovieByTitle(title);
    if (existingMovie)
      return res.status(409).send(`Movie "${title}" already exists.`);

    // Only update the fields that are provided in the request body
    const newTitle = title || oldMovie.title;
    const newWatched = watched || oldMovie.watched;

    // Update the movie in the database
    const changes = await updateMovieById(id, newTitle, newWatched);

    return res.status(200).send({ changes });
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

// REMOVE an existing movie from the database by its ID
export const removeMovieById = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the movie exists before deleting it
    const movieToRemove = await readMovieById(id);
    if (!movieToRemove)
      return res.status(404).send(`Movie with ID "${id}" not found`);

    // Delete the movie from the database
    const changes = await deleteMovieById(id);

    res.status(200).send({ changes });
  } catch (err) {
    res.status(500).send(err.message);
  }
};
