require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { sendOtpEmail } = require("../helpers/sendEmailOTP");
const { sendResetPasswordEmail } = require("../helpers/sendResetPasswordToken");

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Tushar
 *               lastName:
 *                 type: string
 *                 example: Deshmukh
 *               email:
 *                 type: string
 *                 example: tushardeshmukh57985@gmail.com
 *               password:
 *                 type: string
 *                 example: Password@123
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *                 example: Male
 *               role:
 *                 type: string
 *                 enum: [Student, Instructor]
 *                 example: Student
 *               mobileNumber:
 *                 type: string
 *                 example: 9876543210
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, mobileNumber, role } =
      req.body;

    //validate the data
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !mobileNumber ||
      !role
    ) {
      return res.status(404).json({
        message: "All Fields are required!",
      });
    }

    //check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // User exists but OTP not verified
      if (!existingUser.otpVerified) {
        const otp = Math.floor(100000 + Math.random() * 900000);

        // Update the user's OTP and expiry
        existingUser.otp = otp;
        existingUser.otpExpiresIn = Date.now() + 300000; // OTP valid for 5 minutes
        await existingUser.save();

        // Send OTP email
        const emailSent = await sendOtpEmail(email, otp);

        if (!emailSent) {
          return res.status(500).json({
            success: false,
            message: "Failed to send OTP email. Please try again.",
          });
        }

        return res.status(201).json({
          success: true,
          message:
            "OTP sent to your email. Please verify your email to proceed.",
        });
      }

      return res.status(409).json({
        success: false,
        message: "User already exists,Please Login In",
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Send OTP email
    const emailSent = await sendOtpEmail(email, otp);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email. Please try again.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    //save user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      mobileNumber,
      otp,
      otpExpiresIn: Date.now() + 300000,
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "User registered successfully. OTP sent to email.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error,
    });
  }
};

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP for user registration
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: tushardeshmukh57985@gmail.com
 *               otp:
 *                 type: integer
 *                 example: 123456
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad Request
 *       404:
 *         description: User not found or OTP expired
 *       500:
 *         description: Internal Server Error
 */

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate input
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if OTP matches and is not expired
    if (user.otp !== otp || user.otpExpiresIn < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Mark the user as verified and clear OTP fields
    user.otpVerified = true;
    user.otp = undefined;
    user.otpExpiresIn = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     description: Login a user with email and password.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "tushardeshmukh57985@gmail.com"
 *               password:
 *                 type: string
 *                 example: "Tushar@1234"
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 token:
 *                   type: string
 *                   example: "jwt_token_here"
 *       401:
 *         description: Invalid credentials
 */

exports.login = async (req, res) => {
  try {
    //get the data
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    //if user does not exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if the user is verified
    if (!user.otpVerified) {
      return res.status(401).json({
        success: false,
        message: "User is not verified. Please complete OTP verification.",
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    //if password is invalid
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Return success response with token
    return res.status(200).json({
      success: true,
      message: "Login successfully!",
      token,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request a password reset
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Password reset email sent successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate the email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required!",
      });
    }

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set reset token and expiration in user document
    user.passwordResetToken = resetTokenHash;
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // Construct reset URL with query parameter
    const resetUrl = `http://localhost:3000/reset-password/?reset-token=${resetToken}`;

    // Send reset email
    const emailSent = await sendResetPasswordEmail(
      email,
      `Reset your password using the link below:\n\n${resetUrl}`
    );

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send reset email. Please try again.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password reset email sent successfully!",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset the user's password
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resetToken:
 *                 type: string
 *                 example: 34f4d56dfb1e5e45b9b6c6e6d8d3
 *               newPassword:
 *                 type: string
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Password has been successfully reset
 *       400:
 *         description: Invalid or expired reset token
 *       500:
 *         description: Internal server error
 */

exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    // Validate the reset token and new password
    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Reset token and new password are required!",
      });
    }

    // Find user by reset token (hashed)
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: resetTokenHash,
      passwordResetExpires: { $gt: Date.now() }, // Token should be valid (not expired)
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token.",
      });
    }

    // Hash the new password and update the user's password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.passwordResetToken = undefined; // Clear reset token
    user.passwordResetExpires = undefined; // Clear expiration time
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password has been successfully reset!",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/**
 * @swagger
 * /api/auth/my-profile:
 *   get:
 *     summary: Get the profile details of the currently authenticated user
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
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
 *                   example: "Profile retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "64cdef12345a1b2c3d4e5f6g"
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       example: "Doe"
 *                     email:
 *                       type: string
 *                       example: "john.doe@example.com"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-01-01T00:00:00Z"
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */

exports.myProfile = async (req, res) => {
  try {
    const userId = req.user?._id;

    // Validate the user ID
    if (!userId) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find the user in the database
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Return the user's profile data
    return res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      data: user,
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
 * /api/auth/update-profile:
 *   put:
 *     summary: Update the profile of the currently authenticated user
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []  # This route requires the bearer token for authorization
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
 *               lastName:
 *                 type: string
 *                 example: "Doe"
 *               email:
 *                 type: string
 *                 example: "john.doe@example.com"
 *               mobileNumber:
 *                 type: string
 *                 example: "+1234567890"
 *               displayName:
 *                 type: string
 *                 example: "JohnDoe"
 *               profession:
 *                 type: string
 *                 example: "Developer"
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: "1990-01-01"
 *               about:
 *                 type: string
 *                 example: "Experienced web developer with expertise in Node.js"
 *               password:
 *                 type: string
 *                 example: "newPassword123"
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *                   example: "Profile updated successfully"
 *       400:
 *         description: Bad Request - Validation errors or missing fields
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user?._id;

    // Ensure user is authenticated
    if (!userId) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const {
      mobileNumber,
      displayName,
      profession,
      dateOfBirth,
      about,
      password,
      gender,
      profileImage
    } = req.body;

    // If password is provided, hash it
    let updatedData = {
      mobileNumber,
      displayName,
      profession,
      dateOfBirth,
      about,
      gender,
      profileImage
    };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updatedData.password = await bcrypt.hash(password, salt);
    }

    // Update the user's profile
    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Return the updated user profile
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
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