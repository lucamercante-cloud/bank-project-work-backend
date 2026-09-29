import "dotenv/config";
import app from "../src/app";
import mongoose from "mongoose";

let connectionPromise: Promise<typeof mongoose> | null = null;

function getConnection() {
  if (!connectionPromise) {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error(
        "MONGO_URI non configurata nelle Environment Variables di Vercel",
      );
    }
    connectionPromise = mongoose.connect(mongoUri);
  }
  return connectionPromise;
}

export default async function handler(req: any, res: any) {
  await getConnection();
  return app(req, res);
}
