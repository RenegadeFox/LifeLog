import express from "express";
import { getMenuItems, getMenuItemsV2 } from "../controllers/uiController.js";

const router = express.Router();

// All routes start with http://${URL}/menu-items

router.get("/", getMenuItems);

// For testing with non-Siri Shortcut clients
router.get("/v2", getMenuItemsV2);

export default router;
