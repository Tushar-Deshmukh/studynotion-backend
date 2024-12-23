const mongoose = require("mongoose");

const courseCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const CourseCategory = mongoose.model("CourseCategory", courseCategorySchema);

module.exports = CourseCategory;
