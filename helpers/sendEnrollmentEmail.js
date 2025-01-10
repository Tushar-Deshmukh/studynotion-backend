const nodemailer = require("nodemailer");
require("dotenv").config();

const { courseEnrollmentEmail } = require("./enrollmentEmailTemplate");

const sendEnrollmentEmail = async (courseName, name, email) => {

  try {
    // Setup nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASS,
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.NODEMAILER_EMAIL,
      to: email,
      subject: "Course Enrollment Confirmation",
      html: courseEnrollmentEmail(courseName, name),
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return false;
  }
};

module.exports = { sendEnrollmentEmail };
