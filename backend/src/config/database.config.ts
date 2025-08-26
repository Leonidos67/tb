import mongoose from "mongoose";
import { config } from "./app.config";

const connectDatabase = async () => {
  try {
    if (!config.MONGO_URI) {
      console.log("MONGO_URI is empty. Skipping MongoDB connection for development.");
      return;
    }
    await mongoose.connect(config.MONGO_URI);
    console.log("Connected to Mongo database");
  } catch (error) {
    console.log("Error connecting to Mongo database");
    process.exit(1);
  }
};

export default connectDatabase;
