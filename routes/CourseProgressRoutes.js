const express = require('express');
const router = express.Router();
const {myEnrolledCourses, updateCourseProgress, myEnrolledCourseById} = require("../controllers/CourseProgress");
const checkLogin = require("../middlewares/checkLogin");
const isStudent = require("../middlewares/isStudent");

router.get('/my-enrolled-courses',checkLogin,isStudent,myEnrolledCourses);
router.get('/my-enrolled-course/:courseId',checkLogin,isStudent,myEnrolledCourseById);
router.put("/update-course-progress",checkLogin,isStudent,updateCourseProgress);


module.exports = router;