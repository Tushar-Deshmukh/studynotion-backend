const express = require('express');
const router = express.Router();
const {myEnrolledCourses} = require("../controllers/CourseProgress");
const checkLogin = require("../middlewares/checkLogin");
const isStudent = require("../middlewares/isStudent");

router.get('/my-enrolled-courses',checkLogin,isStudent,myEnrolledCourses);

module.exports = router;