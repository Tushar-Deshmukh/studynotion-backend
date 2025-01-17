const Rating = require("../models/Rating");
const Course = require("../models/Course");

/**
 * @swagger
 * /api/add-rating:
 *   post:
 *     summary: Add a rating and review for a course
 *     description: Allows an authenticated user to add a rating and review for a specific course. It also updates the course's average rating.
 *     tags:
 *       - Ratings
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
 *                 example: "64c9f5e7d8f8923b34310b1a"
 *                 description: The ID of the course to rate.
 *               rating:
 *                 type: number
 *                 example: 4.5
 *                 description: The rating value (e.g., 1 to 5).
 *               review:
 *                 type: string
 *                 example: "Great course! Very informative."
 *                 description: The review text.
 *     responses:
 *       201:
 *         description: Rating added successfully.
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
 *                   example: "Rating added successfully"
 *                 data:
 *                   $ref: "#/components/schemas/Rating"
 *       400:
 *         description: Bad request (e.g., missing or invalid fields).
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
 *                   example: "Invalid input data"
 *       401:
 *         description: Unauthorized (e.g., user not logged in).
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
 *       500:
 *         description: Internal server error.
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
 *                   example: "Error adding rating"
 */

exports.addRating = async (req, res) => {
  try {
    const { courseId, rating, review } = req.body;
    const userId = req?.user?._id;

    // Validate input
    if (!courseId || !rating || !review) {
      return res.status(400).json({
        success: false,
        message: "Please provide courseId, rating, and review",
      });
    }

    // Check if the rating is within the valid range (e.g., 1 to 5)
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const existingRating = await Rating.findOne({
      user: userId,
      course: courseId,
    });
    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: "Rating is already given for this course",
      });
    }

    // Create a new rating
    const newRating = await Rating.create({
      user: userId,
      course: courseId,
      rating,
      review,
    });

    // Fetch all ratings for the course
    const ratings = await Rating.find({ course: courseId });

    // Calculate the average rating
    const totalRatings = ratings.length;
    const sumRatings = ratings.reduce((sum, rating) => sum + rating.rating, 0);
    const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

    // Update the course's averageRating
    await Course.findByIdAndUpdate(courseId, { averageRating });

    // Return success response
    return res.status(201).json({
      success: true,
      message: "Rating added successfully",
      data: newRating,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/ratings:
 *   get:
 *     summary: Get all ratings
 *     description: Fetches all ratings from the database, including user details (firstName, lastName, email, and profileImage).
 *     tags:
 *       - Ratings
 *     responses:
 *       200:
 *         description: Ratings fetched successfully.
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
 *                   example: "Ratings fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/RatingWithUser"
 *       404:
 *         description: No ratings found.
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
 *                   example: "No ratings found"
 *       500:
 *         description: Internal server error.
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
 *                   example: "Error fetching ratings"
 */

exports.allRatings = async (req, res) => {
  try {
    // Fetch all ratings and populate user details
    const ratings = await Rating.find().populate({
      path: "user",
      select: "firstName lastName email profileImage",
    });

    // Check if ratings exist
    if (!ratings || ratings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No ratings found",
      });
    }

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Ratings fetched successfully",
      data: ratings,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};