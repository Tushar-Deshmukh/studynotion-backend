const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

const checkLogin = async (req, res, next) => {
  // Extract token from the Authorization header
  let token = req.headers?.authorization;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authorization token is required",
    });
  }

  // Remove the 'Bearer ' prefix if it exists
  if (token.startsWith("Bearer ")) {
    token = token.split(" ")[1];
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user info to the request
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = checkLogin;