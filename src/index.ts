import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDb from "./db/mongoDb";

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors({ origin: process.env.ALLOWED_ORIGINS }));
app.use(express.json());

app.use("/", (req, res) => {
  res.status(200).json({ message: "Backend server is running..." });
});

app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const startServer = async () => {
  try {
    await connectDb();
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

startServer();
