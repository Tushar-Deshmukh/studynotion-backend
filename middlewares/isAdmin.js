const isAdmin = (req, res, next) => {
  // Ensure the user is attached to the request (from checkLogin middleware)
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access. User not authenticated.",
    });
  }

  // Check if the user's role is Admin
  if (req.user.role !== "Admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    });
  }

  // User is an admin, proceed to the next middleware/route
  next();
};

module.exports = isAdmin;
