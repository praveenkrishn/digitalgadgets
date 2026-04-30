import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDatabase = async () => {
  const uri = process.env.MONGODB_URI_DIRECT || process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI or MONGODB_URI_DIRECT is not configured");
  }

  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
  } catch (error) {
    if (error.message?.includes("querySrv ECONNREFUSED")) {
      throw new Error(
        "MongoDB Atlas SRV lookup failed. Set MONGODB_URI_DIRECT to a standard mongodb:// connection string or fix local DNS/Atlas access."
      );
    }

    throw error;
  }
};
