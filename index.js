import express from "express";
import bodyParser from "body-parser";
import activityRoutes from "./routes/activityRoutes.js";
import activityTypeRoutes from "./routes/activityTypeRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import gameRoutes from "./routes/gameRoutes.js";
import movieRoutes from "./routes/movieRoutes.js";
import tvShowRoutes from "./routes/tvShowRoutes.js";
import uiRoutes from "./routes/uiRoutes.js";
import apiKeyAuth from "./middleware/auth.js";

const app = express();
const PORT = 3000;

// Apply API key authentication to all routes
app.use(apiKeyAuth);

app.use(bodyParser.json());
app.use("/activities", activityRoutes);
app.use("/activity-types", activityTypeRoutes);
app.use("/categories", categoryRoutes);
app.use("/games", gameRoutes);
app.use("/movies", movieRoutes);
app.use("/tv-shows", tvShowRoutes);

// Route specifically for the menu items
app.use("/menu-items", uiRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
