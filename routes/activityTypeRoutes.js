import express from "express";
import {
  addActivityType,
  getActivityTypes,
  getActivityTypeById,
  updateActivityTypeById,
  getMenuItems,
  deleteActivityTypeById,
  getMenuItemsV2,
} from "../controllers/activityTypeController.js";

const router = express.Router();

// All routes start with http://${URL}/activity-types

router.post("/", addActivityType); // CREATE a new activity type
router.get("/", getActivityTypes); // READ all activity types
router.put("/:id", updateActivityTypeById); // UPDATE an activity type by ID
router.delete("/:id", deleteActivityTypeById); // DELETE an activity type by ID
router.get("/menu-items", getMenuItems); // READ all available activity types to be used in the menu
router.get("/:id", getActivityTypeById); // READ a single activity type by ID

router.get("/v2/menu-items", getMenuItemsV2); // READ all available activity types to be used in the menu

export default router;
