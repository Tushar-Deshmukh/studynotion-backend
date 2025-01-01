const express = require("express");
const router = express.Router();

const {
  register,
  login,
  verifyOtp,
  forgotPassword,
  resetPassword,
  myProfile,
} = require("../controllers/auth");
const checkLogin = require("../middlewares/checkLogin");

router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/my-profile", checkLogin, myProfile);

module.exports = router;
