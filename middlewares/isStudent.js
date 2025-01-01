const isStudent = (req, res, next) => {

  // Ensure the user is attached to the request (from checkLogin middleware)
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access. User not authenticated.",
    });
  }

  // Check if the user's role is Student
  if (req.user.role !== "Student") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Student privileges required.",
    });
  }

  // User is an Instructor, proceed to the next middleware/route
  next();
};

module.exports = isStudent;
