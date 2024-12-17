import mongoose from "mongoose";

// Track connection state
const connection = {};

async function dbConnect() {
  // Check if the database is already connected
  if (connection.isConnected) {
    // console.log("Database is already connected");
    return;
  }

  try {
    // Ensure a valid Mongo URI is provided
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("Mongo URI is not defined in environment variables.");
    }

    // Attempt to connect to MongoDB
    const db = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    connection.isConnected = db.connections[0].readyState;

    // console.log("MongoDB connected");

    // Handle connection events (optional)
    mongoose.connection.on("connected", () => {
      // console.log("Mongoose connected to DB");
    });

    mongoose.connection.on("error", (err) => {
      // console.error("Mongoose connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      // console.log("Mongoose disconnected");
    });
  } catch (err) {
    // console.error("Database connection failed:", err);
    process.exit(1); // Exit the process if unable to connect
  }
}

export default dbConnect;
