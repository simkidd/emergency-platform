import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDb from "./db/mongoDb";
import router from "./routes";
import { setupSwagger } from "./utils/swagger";

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());

// import routes
app.use("/api/v1", router);

// Swagger setup
setupSwagger(app);

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
