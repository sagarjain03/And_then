import mongoose from "mongoose";

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;

  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not set in environment variables");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    const connection = mongoose.connection;

    connection.on("connected", () => {
      console.log("MongoDB connected successfully");
    });

    connection.on("error", (error) => {
      console.log("MongoDB connection error:", error);
      process.exit(1);
    });

    isConnected = true;
  } catch (error) {
    console.log("Something went wrong in connecting to DB", error);
    throw error;
  }
}
