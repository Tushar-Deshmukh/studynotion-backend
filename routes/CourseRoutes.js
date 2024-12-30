const express = require("express");
const router = express.Router();
const {
  createCourse,
  getMyCourses,
  updateCourseByCourseId,
  deleteCourseByCourseId,
  getAllCoursesByCategoryId,
  getCourseByCourseId
} = require("../controllers/Course");
const checkLogin = require("../middlewares/checkLogin");
const isInstructor = require("../middlewares/isInstructor");

router.post("/create-course", checkLogin, isInstructor, createCourse);
router.get("/my-courses", checkLogin, isInstructor, getMyCourses);
router.get("/get-all-courses/:categoryId",getAllCoursesByCategoryId );
router.get("/course/:courseId",getCourseByCourseId);
router.put(
  "/update-course/:courseId",
  checkLogin,
  isInstructor,
  updateCourseByCourseId
);
router.delete(
  "/delete-course/:courseId",
  checkLogin,
  isInstructor,
  deleteCourseByCourseId
);

module.exports = router;
