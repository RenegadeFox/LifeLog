import express from "express";
import { getMenuItems } from "../controllers/uiController.js";

const router = express.Router();

// All routes start with http://${URL}/menu-items

router.get("/", getMenuItems);

export default router;
