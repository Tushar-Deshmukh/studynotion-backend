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
      createdBy: userId,
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

/**
 * @swagger
 * /api/get-all-courses/{categoryId}:
 *   get:
 *     summary: Get all courses by category ID
 *     tags:
 *       - Courses
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the category to filter courses by
 *     responses:
 *       200:
 *         description: Successfully retrieved courses for the specified category
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
 *                         example: "Learn React.js"
 *                       description:
 *                         type: string
 *                         example: "Master React.js from the ground up"
 *                       price:
 *                         type: number
 *                         example: 499
 *                       tags:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["React.js", "Frontend", "JavaScript"]
 *                       image:
 *                         type: string
 *                         example: "https://example.com/course-image.jpg"
 *                       benefits:
 *                         type: string
 *                         example: "Understand React.js fundamentals and build scalable frontend applications"
 *                       requirements:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["Basic knowledge of JavaScript", "Familiarity with HTML/CSS"]
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-12-17T10:00:00.000Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-12-17T10:00:00.000Z"
 *       404:
 *         description: No courses found for the specified category
 *       500:
 *         description: Internal Server Error
 */

exports.getAllCoursesByCategoryId = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Find courses by category ID
    const courses = await Course.find({ category: categoryId }).populate({
      path: "createdBy",
      select: "firstName lastName",
    });

    if (!courses || courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No courses found for the specified category",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Courses retrieved successfully",
      data: courses,
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
 * /api/update-course/{courseId}:
 *   put:
 *     summary: Update a course by course ID
 *     tags:
 *       - Courses
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the course to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Learn Advanced Node.js"
 *               description:
 *                 type: string
 *                 example: "Advanced topics on Node.js for experienced developers"
 *               price:
 *                 type: number
 *                 example: 599
 *               category:
 *                 type: string
 *                 description: ID of the updated course category (must be a valid ObjectId)
 *                 example: "64c9f5e7d8f8923b34310b1a"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Node.js", "Backend", "Advanced"]
 *               image:
 *                 type: string
 *                 example: "https://example.com/updated-course-image.jpg"
 *               benefits:
 *                 type: string
 *                 example: "Master advanced Node.js concepts"
 *               requirements:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Intermediate knowledge of Node.js", "Understanding of JavaScript"]
 *     responses:
 *       200:
 *         description: Course updated successfully
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
 *                   example: "Course updated successfully"
 *                 data:
 *                   type: object
 *                   description: The updated course object
 *       400:
 *         description: Bad Request (e.g., missing required fields)
 *       404:
 *         description: Course not found
 *       500:
 *         description: Internal Server Error
 */

exports.updateCourseByCourseId = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check if courseId is provided
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    // Update the course and return the updated document
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
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
 * /api/delete-course/{courseId}:
 *   delete:
 *     summary: Delete a course by course ID
 *     tags:
 *       - Courses
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the course to delete
 *     responses:
 *       200:
 *         description: Course deleted successfully
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
 *                   example: "Course deleted successfully"
 *       404:
 *         description: Course or user not found
 *       500:
 *         description: Internal Server Error
 */

exports.deleteCourseByCourseId = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    // Find the course by ID
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Verify the course belongs to the current user
    const user = await User.findById(userId);

    if (!user || !user.createdCourses.includes(courseId)) {
      return res.status(404).json({
        success: false,
        message: "User or course not found in user's createdCourses list",
      });
    }

    // Delete the course
    await course.deleteOne();

    // Remove the course ID from the user's createdCourses array
    user.createdCourses = user.createdCourses.filter(
      (createdCourseId) => createdCourseId.toString() !== courseId
    );

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
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
 * /api/course/{courseId}:
 *   get:
 *     summary: Get a course by course ID
 *     tags:
 *       - Courses
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the course to retrieve
 *     responses:
 *       200:
 *         description: Successfully retrieved the course
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
 *                   example: "Course retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "64cdef12345a1b2c3d4e5f6g"
 *                     title:
 *                       type: string
 *                       example: "Learn React.js"
 *                     description:
 *                       type: string
 *                       example: "Master React.js from the ground up"
 *                     price:
 *                       type: number
 *                       example: 499
 *                     category:
 *                       type: string
 *                       description: The ID of the course category
 *                       example: "64c9f5e7d8f8923b34310b1a"
 *                     tags:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["React.js", "Frontend", "JavaScript"]
 *                     image:
 *                       type: string
 *                       example: "https://example.com/course-image.jpg"
 *                     benefits:
 *                       type: string
 *                       example: "Understand React.js fundamentals and build scalable frontend applications"
 *                     requirements:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Basic knowledge of JavaScript", "Familiarity with HTML/CSS"]
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-12-17T10:00:00.000Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-12-17T10:00:00.000Z"
 *       404:
 *         description: Course not found
 *       500:
 *         description: Internal Server Error
 */

exports.getCourseByCourseId = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check if courseId is provided
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    // Find the course by ID
    const course = await Course.findById(courseId).populate('createdBy','firstName lastName');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Fetch topics for the course
    const topics = await CourseTopic.find({ course: courseId });

    // Process each topic to calculate total duration
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

    // Construct the detailed course object
    const courseDetails = {
      ...course.toObject(),
      topics: topicsWithSubtopics,
      totalDuration,
    };

    return res.status(200).json({
      success: true,
      message: "Course retrieved successfully",
      data: courseDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};