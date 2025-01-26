const Contact = require("../models/Contact");

/**
 * @swagger
 * /api/contact-us:
 *   post:
 *     summary: Submit a contact form
 *     description: Allows users to submit their contact information and message.
 *     tags:
 *       - Contact
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "John"
 *                 description: The user's first name.
 *               lastName:
 *                 type: string
 *                 example: "Doe"
 *                 description: The user's last name.
 *               email:
 *                 type: string
 *                 example: "john.doe@example.com"
 *                 description: The user's email address.
 *               phoneNumber:
 *                 type: number
 *                 example: 1234567890
 *                 description: The user's phone number.
 *               message:
 *                 type: string
 *                 example: "I have a question about your services."
 *                 description: The user's message.
 *     responses:
 *       201:
 *         description: Contact form submitted successfully.
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
 *                   example: "Contact form submitted successfully"
 *                 data:
 *                   $ref: "#/components/schemas/Contact"
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
 *                   example: "Please provide all required fields"
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
 *                   example: "Error submitting contact form"
 */

exports.contactUs = async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, message } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !phoneNumber || !message) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Create a new contact entry
    const newContact = await Contact.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      message,
    });

    // Return success response
    return res.status(201).json({
      success: true,
      message: "Contact form submitted successfully",
      data: newContact,
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
