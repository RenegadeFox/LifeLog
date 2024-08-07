// import crypto from "crypto";
// const API_KEY = crypto.randomBytes(20).toString("hex");
// console.log(`API_KEY: ${API_KEY}`);
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
