import {
  createCategory,
  readAllCategories,
  updateCategoryById,
  readCategoryById,
  readCategoryByName,
  deleteCategoryById,
} from "../models/categoryModel.js";

// ADD a new category in the database
export const addCategory = async (req, res) => {
  const isMultiple = Array.isArray(req.body);

  if (isMultiple) {
    // Request body is an array of categories to be added to the database
    const categoriesToAdd = req.body;
    const categoriesWithIssues = [];

    try {
      const newCategoryIds = await Promise.all(
        categoriesToAdd.map(async (category) => {
          const { name } = category;
          // Check if the category already exists with this name
          const existingCategory = await readCategoryByName();
          if (existingCategory) {
            categoriesWithIssues.push({
              name,
              issue: "Category already exists",
            });
            return 0;
          }

          return await createCategory(name);
        })
      );

      // Check for any issues with the categories
      if (categoriesWithIssues.length > 0) {
        res.status(409).json(categoriesWithIssues);
      } else {
        res.status(201).send(newCategoryIds);
      }
    } catch (err) {
      res.status(500).send(err.message);
    }
  } else {
    const { name } = req.body;

    try {
      // Check if the category already exists
      const existingCategory = await readCategoryByName(name);
      if (existingCategory)
        return res.status(409).send(`Category "${name}" already exists`);

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

    if (allCategories) return res.status(200).json(allCategories);
    else return res.status(204).json([]);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// GET a single category from the database by its ID
export const getCategoryById = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the category exists
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

  try {
    // Check if the category exists before updating it
    const oldCategory = await readCategoryById(id);
    if (!oldCategory)
      return res.status(404).send(`Category with ID "${id}" not found`);
    // Check if the new category name already exists in the database
    const existingCategory = await readCategoryByName(name);
    if (existingCategory)
      return res.status(409).send(`Category "${name}" already exists`);

    // Update the category in the database
    const changes = await updateCategoryById(id, name);

    return res.status(200).send({ changes });
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

// REMOVE an existing category from the database by its ID
export const removeCategoryById = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the category exists before deleting it
    const categoryToRemove = await readCategoryById(id);
    if (!categoryToRemove)
      return res.status(404).send(`Category with ID "${id}" not found`);

    // Delete the category from the database
    const changes = await deleteCategoryById(id);

    res.status(200).send({ changes });
  } catch (err) {
    res.status(500).send(err.message);
  }
};
