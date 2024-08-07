import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.API_KEY;

const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey || apiKey !== API_KEY) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

export default apiKeyAuth;
