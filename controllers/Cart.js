const Cart = require("../models/Cart");

/**
 * @swagger
 * /api/add-to-cart:
 *   post:
 *     summary: Add a course to the user's cart
 *     tags:
 *       - Cart
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               courseId:
 *                 type: string
 *                 description: The ID of the course to add to the cart
 *                 example: "64c9f5e7d8f8923b34310b1a"
 *     responses:
 *       200:
 *         description: Course added to the cart successfully
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
 *                   example: "Course added to the cart successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     cartId:
 *                       type: string
 *                       example: "64d8a1c7b12345678d9e10f1"
 *                     userId:
 *                       type: string
 *                       example: "64cdef12345a1b2c3d4e5f6g"
 *                     courseId:
 *                       type: string
 *                       example: "64c9f5e7d8f8923b34310b1a"
 *       400:
 *         description: Bad Request (e.g., missing required fields or duplicate entry)
 *       500:
 *         description: Internal Server Error
 */

exports.addToCart = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { courseId } = req.body;

    // Validate inputs
    if (!userId) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    // Check if the course is already in the cart
    const existingCartEntry = await Cart.findOne({ userId, courseId });

    if (existingCartEntry) {
      return res.status(400).json({
        success: false,
        message: "Course is already in the cart",
      });
    }

    // Add the course to the cart
    const newCartEntry = new Cart({
      userId,
      courseId,
    });

    await newCartEntry.save();

    return res.status(200).json({
      success: true,
      message: "Course added to the cart successfully",
      data: newCartEntry,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/my-cart:
 *   get:
 *     summary: Get all courses in the user's cart
 *     tags:
 *       - Cart
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
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
 *                   example: "Cart retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       cartId:
 *                         type: string
 *                         example: "64d8a1c7b12345678d9e10f1"
 *                       userId:
 *                         type: string
 *                         example: "64cdef12345a1b2c3d4e5f6g"
 *                       courseId:
 *                         type: string
 *                         example: "64c9f5e7d8f8923b34310b1a"
 *                       courseDetails:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *                             example: "Introduction to JavaScript"
 *                           description:
 *                             type: string
 *                             example: "Learn the basics of JavaScript programming."
 *                           price:
 *                             type: number
 *                             example: 99.99
 *       404:
 *         description: No courses found in the cart
 *       500:
 *         description: Internal Server Error
 */

exports.myCart = async (req, res) => {
  try {
    const userId = req.user?._id;

    // Validate userId
    if (!userId) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Fetch cart items for the user
    const cartItems = await Cart.find({ userId }).populate({
      path: "courseId",
      select: "title description price image createdBy",
      populate: {
        path: "createdBy",
        select: "firstName lastName",
      },
    });

    // Check if the cart is empty
    if (!cartItems || cartItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No courses found in the cart",
      });
    }

    // Format response data
    const cartDetails = cartItems.map((item) => ({
      cartId: item._id,
      userId: item.userId,
      courseId: item.courseId._id,
      courseDetails: {
        ...item.courseId.toObject(),
        createdBy: item.courseId.createdBy,
      },
    }));

    return res.status(200).json({
      success: true,
      message: "Cart retrieved successfully",
      data: cartDetails,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/remove-from-cart:
 *   delete:
 *     summary: Remove a course from the user's cart
 *     tags:
 *       - Cart
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               courseId:
 *                 type: string
 *                 description: The ID of the course to remove from the cart
 *                 example: "64c9f5e7d8f8923b34310b1a"
 *     responses:
 *       200:
 *         description: Course removed from the cart successfully
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
 *                   example: "Course removed from the cart successfully"
 *       400:
 *         description: Bad Request (e.g., missing required fields or course not in cart)
 *       404:
 *         description: Course not found in the cart
 *       500:
 *         description: Internal Server Error
 */

exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { courseId } = req.body;

    // Validate inputs
    if (!userId) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    // Check if the course exists in the cart
    const cartItem = await Cart.findOne({ userId, courseId });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Course not found in the cart",
      });
    }

    // Remove the course from the cart
    await Cart.deleteOne({ userId, courseId });

    return res.status(200).json({
      success: true,
      message: "Course removed from the cart successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};