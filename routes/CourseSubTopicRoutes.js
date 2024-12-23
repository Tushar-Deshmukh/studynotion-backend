const express = require('express');
const router = express.Router();
const {createCourseSubTopic} = require("../controllers/CourseSubTopic")

router.post("/create-course-subtopic",createCourseSubTopic)

module.exports = router;