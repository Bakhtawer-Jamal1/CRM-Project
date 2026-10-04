const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI .env mein missing hai");
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });
}

module.exports = connectDB;