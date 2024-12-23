const bcrypt = require("bcrypt");
const User = require("../models/User");

const createDefaultAdmin = async () => {
  try {
    //check if admin exists
    const adminExists = await User.findOne({ role: "Admin" });

    if (adminExists) {
      console.log("Default Admin exists");
      return;
    }

    //if no admin exists then create one
    const hashedPassword = await bcrypt.hash("Tushar@1234", 10);

    const defaultAdmin = new User({
      firstName: "Tushar",
      lastName: "Deshmukh",
      email: "tushardeshmukh57985@gmail.com",
      password: hashedPassword,
      gender: "Male",
      role: "Admin",
      mobileNumber: "0000000000", // Dummy number, update as needed
      otpVerified: true,
    });

    await defaultAdmin.save();

    console.log("Default Admin created successfully.");
  } catch (error) {
    console.error("Error creating default admin:", error.message);
  }
};

module.exports = createDefaultAdmin;