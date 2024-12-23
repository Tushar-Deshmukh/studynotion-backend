const express = require("express");
const router = express.Router();
const isAdmin = require("../middlewares/isAdmin");
const checkLogin = require("../middlewares/checkLogin");
const {
  createCourseCategory,
  getAllCategories,
  getCategoryById,
  updateCategoryById,
  deleteCategoryById,
} = require("../controllers/CourseCategory");

router.post(
  "/create-course-category",
  checkLogin,
  isAdmin,
  createCourseCategory
);
router.get("/categories", getAllCategories);
router.get("/get-category/:id", getCategoryById);
router.put("/update-category/:id", checkLogin, isAdmin, updateCategoryById);
router.delete("/delete-category/:id", checkLogin, isAdmin, deleteCategoryById);

module.exports = router;