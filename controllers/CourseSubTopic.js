const CourseSubTopic = require("../models/CourseSubTopic");

/**
 * @swagger
 * /api/create-course-subtopic:
 *   post:
 *     summary: Create a new course subtopic
 *     tags:
 *       - Course SubTopics
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               videoUrl:
 *                 type: string
 *                 example: "https://example.com/video.mp4"
 *               title:
 *                 type: string
 *                 example: "Introduction to JavaScript"
 *               description:
 *                 type: string
 *                 example: "Learn the basics of JavaScript."
 *               videoPlaybackTime:
 *                 type: string
 *                 example: "01:30:45"
 *                 description: Video duration in HH:MM:SS format
 *               topic:
 *                 type: string
 *                 example: "648a05aee6f4b2e5c51e1e88"
 *                 description: The ID of the related course topic
 *     responses:
 *       201:
 *         description: Course subtopic created successfully
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */

exports.createCourseSubTopic = async (req, res) => {
  try {
    const { videoUrl, title, description, videoPlaybackTime, topic } = req.body;

    // Validate required fields
    if (!videoUrl || !title || !description || !videoPlaybackTime || !topic) {
      return res.status(400).json({
        success: false,
        message:
          "All fields (videoUrl, title, description, videoPlaybackTime, topic) are required.",
      });
    }

    // Create a new subtopic
    const subTopic = new CourseSubTopic({
      videoUrl,
      title,
      description,
      videoPlaybackTime,
      topic,
    });

    await subTopic.save();

    return res.status(201).json({
      success: true,
      message: "Course subtopic created successfully",
      data: subTopic,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};