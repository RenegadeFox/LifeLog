import express from "express";
import {
  logActivity,
  getActivities,
  getActivityById,
  updateActivityById,
  deleteActivityById,
} from "../controllers/activityController.js";

const router = express.Router();

// All routes start with http://${URL}/activities

router.post("/", logActivity); // CREATE a new activity
router.get("/", getActivities); // READ all activities
router.put("/:id", updateActivityById); // UPDATE an activity by ID
router.delete("/:id", deleteActivityById); // DELETE an activity by ID
router.get("/:id", getActivityById); // READ a single activity by ID

export default router;
