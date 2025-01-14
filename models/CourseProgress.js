const mongoose = require("mongoose");

const courseProgressSchmea = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    completedSubTopics: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
    progressPercentage: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["All", "Completed", "Pending"],
      default: "All",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CourseProgress',courseProgressSchmea);