require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User = require("../models/User");
const { sendEnrollmentEmail } = require("../helpers/sendEnrollmentEmail");
const Course = require("../models/Course");

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret =
  "whsec_9f82a93ecb7def426656a5614f74ded28fda2dce08e7e4ef8fb3415a68000668";

/**
 * @swagger
 * /api/create-checkout-session:
 *   post:
 *     summary: Create a Stripe Checkout Session for course purchase
 *     description: This endpoint creates a Stripe Checkout Session to allow users to purchase a course. It returns a session ID that can be used to redirect the user to the Stripe payment page.
 *     tags:
 *       - Stripe
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - courseId
 *             properties:
 *               amount:
 *                 type: number
 *                 description: The amount to be paid in INR (Indian Rupees).
 *                 example: 500
 *               courseId:
 *                 type: string
 *                 description: The ID of the course to be purchased.
 *                 example: "64c9f5e7d8f8923b34310b1a"
 *     responses:
 *       200:
 *         description: Stripe Checkout Session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The ID of the Stripe Checkout Session.
 *                   example: "cs_test_a1b2c3d4e5f6g7h8i9j0"
 *       400:
 *         description: Bad Request (e.g., missing required fields or invalid data)
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
 *                   example: "Amount and Course ID are required"
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
 *                   example: "Error creating Stripe session"
 */

exports.createCheckoutSession = async (req, res) => {
  try {
    const { amount, courseId } = req.body;
    const userId = req?.user?._id;

    // Validate inputs
    if (!amount || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Amount and Course ID are required",
      });
    }

    //convert user id to string because stripe does not accept the ObjectId
    const userIdString = userId.toString();

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr", // Currency set to INR
            product_data: {
              name: "Course Purchase",
            },
            unit_amount: amount * 100, // Amount in paise (e.g., 500 INR = 50000 paise)
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/cancel`,
      metadata: {
        courseId,
        userId: userIdString,
      },
    });

    // Return the session ID
    res.status(201).json({ success: true, id: session.id, url: session.url });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.enrollCourse = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    // Construct the event using the raw request body
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook Error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      const { courseId, userId } = session.metadata;

      try {
        // Find the user
        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({
            success: false,
            message: "User not found",
          });
        }

        //find the course
        const course = await Course.findById(courseId);
        if (!course) {
          return res.status(404).json({
            success: false,
            message: "Course not found",
          });
        }

        // Check if the course is already enrolled
        if (user.enrolledCourses.includes(courseId)) {
          return res.status(400).json({
            success: false,
            message: "Course already enrolled",
          });
        }

        // Push the courseId into the enrolledCourses array
        user.enrolledCourses.push(courseId);

        // Save the updated user
        await user.save();

        console.log("User updated:", user);

        const username = `${user.firstName} ${user.lastName}`;

        const enrollmentEmailSent = await sendEnrollmentEmail(
          course.title,
          username,
          user.email
        );
        console.log("email sent", enrollmentEmailSent);

        return res.status(200).json({
          success: true,
          message: "Course enrolled successfully",
          user,
        });
      } catch (err) {
        console.error("Error updating user:", err);
        return res.status(500).json({
          success: false,
          message: "Internal Server Error",
          error: err.message,
        });
      }

    default:
      console.log(`Unhandled event type: ${event.type}`);
      return res.status(200).send(); // Acknowledge unhandled event types
  }
};
