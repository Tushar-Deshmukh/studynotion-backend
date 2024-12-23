const mongoose = require("mongoose");
const createDefaultAdmin = require("../utils/createDefaultAdmin")

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI);
    console.log(
      `Database connected successfully: ${connection.connection.host}`
    );
    createDefaultAdmin();
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1); // Exit the application if there's an error
  }
};

module.exports = connectDB;
