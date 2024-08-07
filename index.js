import express from "express";
import bodyParser from "body-parser";
import activityRoutes from "./routes/activityRoutes.js";
import activityTypeRoutes from "./routes/activityTypeRoutes.js";
import gameRoutes from "./routes/gameRoutes.js";
import apiKeyAuth from "./middleware/auth.js";

const app = express();
const PORT = 3000;

// Apply API key authentication to all routes
app.use(apiKeyAuth);

app.use(bodyParser.json());
app.use("/activities", activityRoutes);
app.use("/activity-types", activityTypeRoutes);
app.use("/games", gameRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
