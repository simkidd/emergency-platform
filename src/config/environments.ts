import dotenv from "dotenv";

dotenv.config();

export const environments = {
  MONGO_URI: process.env.MONGO_URI || "",
};
