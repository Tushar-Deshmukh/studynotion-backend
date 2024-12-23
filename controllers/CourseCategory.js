const CourseCategory = require("../models/CourseCategory");

/**
 * @swagger
 * /api/create-course-category:
 *   post:
 *     summary: Create a new course category
 *     tags:
 *       - Course Categories
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Programming
 *               description:
 *                 type: string
 *                 example: Courses related to programming languages
 *     responses:
 *       201:
 *         description: Course category created successfully
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */

exports.createCourseCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(404).json({
        success: false,
        message: "All fields are required",
      });
    }

    const courseCategory = new CourseCategory({
      name: name,
      description: description,
    });

    await courseCategory.save();

    return res.status(201).json({
      success: true,
      message: "Course Category created successfully!",
      data: courseCategory,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error?.message,
    });
  }
};

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Retrieve all course categories
 *     tags:
 *       - Course Categories
 *     responses:
 *       200:
 *         description: A list of course categories
 *       500:
 *         description: Internal Server Error
 */

exports.getAllCategories = async (req, res) => {
  try {
    const allCategories = await CourseCategory.find({});

    if (!allCategories) {
      return res.status(404).json({
        success: false,
        message: "No categories found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Categories found successfully!",
      data: allCategories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error?.message,
    });
  }
};

/**
 * @swagger
 * /api/get-category/{id}:
 *   get:
 *     summary: Retrieve a single course category by ID
 *     tags:
 *       - Course Categories
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the course category to retrieve
 *     responses:
 *       200:
 *         description: Course category retrieved successfully
 *       404:
 *         description: Course category not found
 *       500:
 *         description: Internal Server Error
 */

exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await CourseCategory.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "No category found for this id",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category found successfully",
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error?.message,
    });
  }
};

/**
 * @swagger
 * /api/update-category/{id}:
 *   put:
 *     summary: Update a course category by ID
 *     tags:
 *       - Course Categories
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the course category to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Advanced Programming
 *               description:
 *                 type: string
 *                 example: Updated description for programming courses
 *     responses:
 *       200:
 *         description: Course category updated successfully
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Course category not found
 *       500:
 *         description: Internal Server Error
 */

exports.updateCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await CourseCategory.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "No category found for this id",
      });
    }

    const updatedCategory = await CourseCategory.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({
        success: false,
        message: "Could not update the category",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category updated successfully!",
      data: updatedCategory,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error?.message,
    });
  }
};

/**
 * @swagger
 * /api/delete-category/{id}:
 *   delete:
 *     summary: Delete a course category by ID
 *     tags:
 *       - Course Categories
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the course category to delete
 *     responses:
 *       200:
 *         description: Course category deleted successfully
 *       404:
 *         description: Course category not found
 *       500:
 *         description: Internal Server Error
 */

exports.deleteCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await CourseCategory.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "No category found for this id",
      });
    }

    const deletedCategory = await CourseCategory.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Course category deleted successfully!",
      data: deletedCategory,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error?.message,
    });
  }
};
