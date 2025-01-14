const CourseProgress = require("../models/CourseProgress");

/**
 * @swagger
 * /api/my-enrolled-courses:
 *   get:
 *     summary: Get enrolled courses for the authenticated user
 *     description: Fetches the list of courses enrolled by the authenticated user, including course name, description, total duration, and progress percentage.
 *     tags:
 *       - Enrolled Courses
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Enrolled courses fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Enrolled courses fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "64c9f5e7d8f8923b34310b1a"
 *                       title:
 *                         type: string
 *                         example: "Introduction to Programming"
 *                       description:
 *                         type: string
 *                         example: "Learn the basics of programming."
 *                       totalDuration:
 *                         type: string
 *                         example: "02:30:00"
 *                       progressPercentage:
 *                         type: number
 *                         example: 50
 *       401:
 *         description: Unauthorized (e.g., user not logged in)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Unauthorized: Please log in"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 *                 error:
 *                   type: string
 *                   example: "Error fetching enrolled courses"
 */

exports.myEnrolledCourses = async (req, res) => {
  try {
    const userId = req?.user?._id;

    const enrollCourses = await CourseProgress.find({
      userId: userId,
    }).populate({
      path: "courseId",
      select: "title description totalDuration image",
    });

    if (!enrollCourses && enrollCourses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "You dont have any enrolled courses!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "courses fetched successfully!",
      data: enrollCourses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
