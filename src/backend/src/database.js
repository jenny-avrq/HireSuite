const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/HireSuite";

    if (process.env.NODE_ENV === "production" && !process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI must be set in production");
    }

    await mongoose.connect(uri);
    console.log("MongoDB Connected!");
    
  } catch (err) {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  }
};

module.exports = connectDB;
