import {
  createCategory,
  readAllCategories,
  updateCategoryById,
  readCategoryById,
  deleteCategoryById,
} from "../models/categoryModel.js";

// ADD a new category in the database
export const addCategory = async (req, res) => {
  const isMultiple = Array.isArray(req.body);

  // Check if the request body is an array of categories to be created
  if (isMultiple) {
    const categoriesToAdd = req.body;

    try {
      const newCategoryIds = await Promise.all(
        categoriesToAdd.map(async (category) => {
          const { name } = category;
          return await createCategory(name);
        })
      );
      res.status(201).send(newCategoryIds);
    } catch (err) {
      res.status(500).send(err.message);
    }
  } else {
    const { name } = req.body;

    try {
      const newCategoryId = await createCategory(name);

      res.status(201).send({ newCategoryId });
    } catch (err) {
      res.status(500).send(err.message);
    }
  }
};

// GET all categories from the database
export const getAllCategories = async (req, res) => {
  try {
    const allCategories = await readAllCategories();

    res.status(200).json(allCategories || []);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// GET a single category from the database by its ID
export const getCategoryById = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await readCategoryById(id);

    if (!category)
      return res.status(404).send(`Category with ID "${id}" not found`);

    return res.status(200).json(category);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// EDIT a single category in the database by its ID
export const editCategoryById = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  // Return an error, if "name" is not provided in the request body
  if (!name) return res.status(400).send("Missing name");

  // Update the category in the database
  try {
    // Check if the category exists before updating it
    const oldCategory = await readCategoryById(id);
    if (!oldCategory)
      return res.status(404).send(`Category with ID "${id}" not found`);

    const changes = await updateCategoryById(id, name || oldCategory.name);

    return res.status(200).send({ changes });
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

// REMOVE an existing category from the database by its ID
export const removeCategoryById = async (req, res) => {
  const { id } = req.params;

  // Delete the category from the database
  try {
    // Check if the category exists before deleting it
    const categoryToRemove = await readCategoryById(id);
    if (!categoryToRemove)
      return res.status(404).send(`Category with ID "${id}" not found`);

    const changes = await deleteCategoryById(id);

    res.status(200).send({ changes });
  } catch (err) {
    res.status(500).send(err.message);
  }
};
