const mongoose = require("mongoose");

const courseTopicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  },
  { timestamps: true }
);

const CourseTopic = mongoose.model("CourseTopic", courseTopicSchema);

module.exports = CourseTopic;