const CourseProgress = require("../models/CourseProgress");
const Course = require("../models/Course");

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
      select: "_id title description totalDuration image",
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

/**
 * @swagger
 * /api/update-course-progress:
 *   put:
 *     summary: Update course progress by marking a subtopic as completed
 *     description: |
 *       This API updates the course progress for a user by adding a subtopic ID to the `completedSubTopics` array.
 *       It also calculates the progress percentage and updates the status of the course progress.
 *     tags:
 *       - Course Progress
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               courseId:
 *                 type: string
 *                 description: The ID of the course
 *                 example: "64f1b2b3c9e77b001a8b4567"
 *               subTopicId:
 *                 type: string
 *                 description: The ID of the subtopic to mark as completed
 *                 example: "64f1b2b3c9e77b001a8b4568"
 *     responses:
 *       200:
 *         description: Course progress updated successfully
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
 *                   example: "Course progress updated successfully"
 *                 data:
 *                   $ref: "#/components/schemas/CourseProgress"
 *       404:
 *         description: Course not found
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
 *                   example: "Course not found"
 *       500:
 *         description: Internal server error
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
 *                   example: "Internal server error"
 */

exports.updateCourseProgress = async (req, res) => {
  const userId = req?.user?._id;
  const { courseId, subTopicId } = req.body;

  try {
    // Find the course progress document for the user and course
    let courseProgress = await CourseProgress.findOne({
      userId,
      courseId,
    });

    // Fetch the course to get the total number of subtopics
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Calculate the total number of subtopics in the course
    const totalSubTopics = course.courseContent.topics.reduce(
      (count, topic) => count + topic.subTopics.length,
      0
    );

    // Check if the subtopic is already in the completedSubTopics array
    if (!courseProgress.completedSubTopics.includes(subTopicId)) {
      // Push the subtopic ID into the completedSubTopics array
      courseProgress.completedSubTopics.push(subTopicId);

      // Calculate the progress percentage
      const completedSubTopicsCount = courseProgress.completedSubTopics.length;
      courseProgress.progressPercentage = Math.round(
        (completedSubTopicsCount / totalSubTopics) * 100
      );

      // Update the status based on progress
      if (courseProgress.progressPercentage === 100) {
        courseProgress.status = "Completed";
      } else if (courseProgress.progressPercentage > 0) {
        courseProgress.status = "Pending";
      }

      // Save the updated document
      await courseProgress.save();

      return res.status(200).json({
        success: true,
        message: "Course progress updated successfully",
        data: courseProgress,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Subtopic already marked as completed",
        data: courseProgress,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};