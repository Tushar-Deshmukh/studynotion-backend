require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User = require("../models/User");

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = "whsec_...";

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
  const sig = request.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      const { courseId, userId } = session.metadata;

      // Update the user's enrolledCourses array
      User.findByIdAndUpdate(
        userId,
        { $push: { enrolledCourses: courseId } },
        { new: true }
      )
        .exec()
        .then((user) => {
          console.log("User updated:", user);
        })
        .catch((err) => {
          console.error("Error updating user:", err);
        });

      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  response.send();
};
