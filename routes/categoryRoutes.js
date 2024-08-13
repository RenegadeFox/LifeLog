import express from "express";
import {
  addCategory,
  getAllCategories,
  getCategoryById,
  editCategoryById,
  removeCategoryById,
} from "../controllers/categoryController.js";

const router = express.Router();

// All routes start with http://${URL}/categories

router.post("/", addCategory); // CREATE a new category
router.get("/", getAllCategories); // READ all categories
router.get("/:id", getCategoryById); // READ a single category by ID
router.put("/:id", editCategoryById); // UPDATE a category by ID
router.delete("/:id", removeCategoryById); // DELETE a category by ID

export default router;
