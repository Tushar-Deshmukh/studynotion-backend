const CourseTopic = require("../models/CourseTopic");

/**
 * @swagger
 * /api/create-course-topic:
 *   post:
 *     summary: Create a new course topic
 *     tags:
 *       - Course Topic
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the course topic
 *                 example: "Introduction to JavaScript"
 *               course:
 *                 type: string
 *                 description: ID of the course (must be a valid ObjectId)
 *                 example: "64c9f5e7d8f8923b34310b1a"
 *     responses:
 *       201:
 *         description: Course topic created successfully
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
 *                   example: "Course topic created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "64ca88e9f28b1b1d2321b09a"
 *                     name:
 *                       type: string
 *                       example: "Introduction to JavaScript"
 *                     course:
 *                       type: string
 *                       example: "64c9f5e7d8f8923b34310b1a"
 *                     createdAt:
 *                       type: string
 *                       example: "2024-12-17T12:34:56.789Z"
 *                     updatedAt:
 *                       type: string
 *                       example: "2024-12-17T12:34:56.789Z"
 *       400:
 *         description: Bad Request (e.g., missing required fields)
 *       500:
 *         description: Internal Server Error
 */

exports.createCourseTopic = async (req, res) => {
  try {
    const { name, course } = req.body;

    if (!name || !course) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const newCourseTopic = new CourseTopic({
      name,
      course,
    });

    await newCourseTopic.save();

    return res.status(201).json({
      success: true,
      message: "Course Topic created successfully!",
      data: newCourseTopic,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/course-topics/{courseId}:
 *   get:
 *     summary: Get all course topics by course ID
 *     tags:
 *       - Course Topic
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *           example: "64c9f5e7d8f8923b34310b1a"
 *         description: ID of the course (must be a valid ObjectId)
 *     responses:
 *       200:
 *         description: Successfully fetched course topics
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
 *                   example: "Course topics fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "64ca88e9f28b1b1d2321b09a"
 *                       name:
 *                         type: string
 *                         example: "Introduction to JavaScript"
 *                       course:
 *                         type: string
 *                         example: "64c9f5e7d8f8923b34310b1a"
 *                       createdAt:
 *                         type: string
 *                         example: "2024-12-17T12:34:56.789Z"
 *                       updatedAt:
 *                         type: string
 *                         example: "2024-12-17T12:34:56.789Z"
 *       404:
 *         description: Course not found or no topics exist
 *       500:
 *         description: Internal Server Error
 */

exports.getCourseTopicsByCourseId = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    const courseTopics = await CourseTopic.find({ course: courseId });

    if (!courseTopics.length) {
      return res.status(404).json({
        success: false,
        message: "No topics found for the given course ID",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Course topics fetched successfully",
      data: courseTopics,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
