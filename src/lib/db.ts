import mongoose from "mongoose";

declare global {

  var __mongooseConnection: Promise<typeof mongoose> | undefined;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (global.__mongooseConnection) {
    return global.__mongooseConnection;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set in environment variables");
  }

  global.__mongooseConnection = mongoose.connect(uri, {
    bufferCommands: false,
  });

  return global.__mongooseConnection;
}


