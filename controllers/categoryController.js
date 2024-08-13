import {
  createCategory,
  readAllCategories,
  updateCategoryById,
  readCategoryById,
  deleteCategoryById,
} from "../models/categoryModel.js";

// Create a new category in the database
export const addCategory = async (req, res) => {
  const isMultipleTypes = Array.isArray(req.body);

  // Check if the request body is an array of categories to be created
  if (isMultipleTypes) {
    const categories = req.body;
    try {
      const ids = await Promise.all(
        categories.map(async (category) => {
          const { name } = category;
          return await createCategory(name);
        })
      );
      res.status(201).send(ids);
    } catch (err) {
      res.status(500).send(err.message);
    }
  } else {
    const { name } = req.body;
    try {
      const id = await createCategory(name);

      res.status(201).send({ id });
    } catch (err) {
      res.status(500).send(err.message);
    }
  }
};

// Get all categories from the database
export const getAllCategories = async (req, res) => {
  try {
    const allCategories = await readAllCategories();
    res.status(200).json(allCategories || []);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Get a single category from the database by its ID
export const getCategoryById = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await readCategoryById(id);

    if (category) res.status(200).json(category);
    else res.status(404).send(`Category with ID "${id}" not found`);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Update/edit a single category in the database by its ID
export const editCategoryById = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  // Return an error, if "name" is not provided in the request body
  if (!name) {
    return res.status(400).send("Please provide a name, for the category");
  }

  // Update the category in the database
  try {
    // Check if the category exists before updating it
    const originalCategory = await readCategoryById(id);
    if (!originalCategory)
      return res.status(404).send(`Category with ID "${id}" not found`);

    const changes = await updateCategoryById(id, name || originalCategory.name);

    return res.status(200).send({ changes });
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

// Delete an existing category from the database by its ID
export const removeCategoryById = async (req, res) => {
  const { id } = req.params;

  // Delete the category from the database
  try {
    // Check if the category exists before deleting it
    const category = await readCategoryById(id);
    if (!category)
      return res.status(404).send(`Category with ID "${id}" not found`);

    const changes = await deleteCategoryById(id);
    res.status(200).send({ changes });
  } catch (err) {
    res.status(500).send(err.message);
  }
};
