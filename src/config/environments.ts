import dotenv from "dotenv";

dotenv.config();

export const environments = {
  MONGO_URI: process.env.MONGO_URI || "",
  JWT_SECRET: process.env.JWT_SECRET || "",
  PORT: process.env.PORT || "",
  BASE_URL: process.env.BASE_URL || "",
  ABLY_API_KEY: process.env.ABLY_API_KEY || "",
};
