const express = require("express");
const router = express.Router();
const { createCourse, getMyCourses } = require("../controllers/Course");
const checkLogin = require("../middlewares/checkLogin");
const isInstructor = require("../middlewares/isInstructor");

router.post("/create-course", checkLogin, isInstructor, createCourse);
router.get("/my-courses", checkLogin, isInstructor, getMyCourses);


module.exports = router;
