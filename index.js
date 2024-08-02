import express from "express";
import bodyParser from "body-parser";
import activityRoutes from "./routes/activityRoutes.js";
import activityTypeRoutes from "./routes/activityTypeRoutes.js";

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use("/activities", activityRoutes);
app.use("/activity-types", activityTypeRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
