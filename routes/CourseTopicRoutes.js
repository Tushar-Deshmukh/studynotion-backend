const express = require('express');
const router = express.Router();
const {createCourseTopic,getCourseTopicsByCourseId} = require("../controllers/CourseTopic")
const checkLogin = require("../middlewares/checkLogin");
const isInstructor = require("../middlewares/isInstructor");

router.post("/create-course-topic",checkLogin,isInstructor,createCourseTopic);
router.get("/course-topics/:courseId",checkLogin,isInstructor,getCourseTopicsByCourseId);



module.exports = router;