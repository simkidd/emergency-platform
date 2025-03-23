import mongoose from "mongoose";
import { environments } from "../config/environments";

const connectDb = async () => {
  try {
    const db = await mongoose.connect(environments.MONGO_URI);

    return db;
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

export default connectDb;
