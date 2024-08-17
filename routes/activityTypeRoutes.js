import express from "express";
import {
  addActivityType,
  getAllActivityTypes,
  getActivityTypeById,
  editActivityTypeById,
  removeActivityTypeById,
} from "../controllers/activityTypeController.js";

const router = express.Router();

// All routes start with http://${URL}/activity-types

router.post("/", addActivityType); // CREATE a new activity type
router.get("/", getAllActivityTypes); // READ all activity types
router.get("/:id", getActivityTypeById); // READ a single activity type by ID
router.put("/:id", editActivityTypeById); // UPDATE an activity type by ID
router.delete("/:id", removeActivityTypeById); // DELETE an activity type by ID

export default router;
