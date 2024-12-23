const Course = require("../models/Course");
const User = require("../models/User");
const CourseTopic = require("../models/CourseTopic");
const CourseSubTopic = require("../models/CourseSubTopic");

/**
 * @swagger
 * /api/create-course:
 *   post:
 *     summary: Create a new course
 *     tags:
 *       - Courses
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Learn Node.js"
 *               description:
 *                 type: string
 *                 example: "Comprehensive course on Node.js for beginners"
 *               price:
 *                 type: number
 *                 example: 499
 *               category:
 *                 type: string
 *                 description: ID of the course category (must be a valid ObjectId)
 *                 example: "64c9f5e7d8f8923b34310b1a"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Node.js", "Backend", "JavaScript"]
 *               image:
 *                 type: string
 *                 example: "https://example.com/course-image.jpg"
 *               benefits:
 *                 type: string
 *                 example: "Understand Node.js fundamentals and build scalable applications"
 *               requirements:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Basic understanding of JavaScript", "Familiarity with web development"]
 *     responses:
 *       201:
 *         description: Course created successfully
 *       400:
 *         description: Bad Request (e.g., missing required fields)
 *       500:
 *         description: Internal Server Error
 */

exports.createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      category,
      tags,
      image,
      benefits,
      requirements,
    } = req.body;

    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Validate that all required fields are provided
    if (
      !title ||
      !description ||
      !price ||
      !category ||
      !tags ||
      !image ||
      !benefits ||
      !requirements
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Create the course
    const newCourse = new Course({
      title,
      description,
      price,
      category,
      tags,
      image,
      benefits,
      requirements,
    });

    // Save the course to the database
    await newCourse.save();

    // Push the course _id into the createdCourses array of the user
    user.createdCourses = user.createdCourses || []; // Ensure the field exists
    user.createdCourses.push(newCourse._id);
    await user.save();

    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: newCourse,
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
 * /api/my-courses:
 *   get:
 *     summary: Get courses created by the logged-in user
 *     tags:
 *       - Courses
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the user's created courses
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
 *                   example: "Courses retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "64cdef12345a1b2c3d4e5f6g"
 *                       title:
 *                         type: string
 *                         example: "Learn Node.js"
 *                       description:
 *                         type: string
 *                         example: "Comprehensive course on Node.js for beginners"
 *                       price:
 *                         type: number
 *                         example: 499
 *                       category:
 *                         type: string
 *                         description: ID of the course category
 *                         example: "64c9f5e7d8f8923b34310b1a"
 *                       tags:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["Node.js", "Backend", "JavaScript"]
 *                       image:
 *                         type: string
 *                         example: "https://example.com/course-image.jpg"
 *                       benefits:
 *                         type: string
 *                         example: "Understand Node.js fundamentals and build scalable applications"
 *                       requirements:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["Basic understanding of JavaScript", "Familiarity with web development"]
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-12-17T10:00:00.000Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-12-17T10:00:00.000Z"
 *       401:
 *         description: Unauthorized (e.g., missing or invalid token)
 *       404:
 *         description: User not found or no created courses
 *       500:
 *         description: Internal Server Error
 */

exports.getMyCourses = async (req, res) => {
    try {
      const userId = req.user?._id;
  
      // Fetch user and created courses
      const user = await User.findById(userId).populate("createdCourses");
  
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
  
      if (!user.createdCourses || user.createdCourses.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No courses found for this user",
        });
      }
  
      // Process each course to calculate total duration
      const coursesWithDetails = await Promise.all(
        user.createdCourses.map(async (course) => {
          // Fetch topics for the course
          const topics = await CourseTopic.find({ course: course._id });
  
          // Fetch subtopics and calculate total duration
          let totalDurationInSeconds = 0;
          const topicsWithSubtopics = await Promise.all(
            topics.map(async (topic) => {
              // Fetch subtopics for the topic
              const subtopics = await CourseSubTopic.find({ topic: topic._id });
  
              // Calculate total duration for subtopics
              subtopics.forEach((subtopic) => {
                const [hours, minutes, seconds] = subtopic.videoPlaybackTime
                  .split(":")
                  .map(Number);
                totalDurationInSeconds += hours * 3600 + minutes * 60 + seconds;
              });
  
              return {
                ...topic.toObject(),
                subtopics,
              };
            })
          );
  
          // Convert total seconds to HH:MM:SS
          const hours = Math.floor(totalDurationInSeconds / 3600);
          const minutes = Math.floor((totalDurationInSeconds % 3600) / 60);
          const seconds = totalDurationInSeconds % 60;
  
          const totalDuration = `${String(hours).padStart(2, "0")}:${String(
            minutes
          ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  
          return {
            ...course.toObject(),
            topics: topicsWithSubtopics,
            totalDuration, // Add total duration to the course object
          };
        })
      );
  
      return res.status(200).json({
        success: true,
        message: "Courses retrieved successfully",
        data: coursesWithDetails,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  };