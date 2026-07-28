import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app.js";
import pino from "pino";

dotenv.config();

const logger = pino();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  logger.error("MONGO_URI is missing in environment variables.");
  process.exit(1);
}

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI!);
    logger.info("Connected to MongoDB successfully");

    app.listen(PORT, () => {
      logger.info(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to start server");
    process.exit(1);
  }
}

startServer();
