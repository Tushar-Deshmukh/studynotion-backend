const mongoose = require("mongoose");

const subTopicSchema = new mongoose.Schema({
  videoUrl: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  videoPlaybackTime: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        // Regex to match HH:MM:SS format
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(v);
      },
      message: (props) =>
        `${props.value} is not a valid video playback time! Use HH:MM:SS format.`,
    },
  },
});

const topicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  topicDuration: {
    type: String,
    default: "00:00:00",
  },
  subTopics: [subTopicSchema],
});

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseCategory",
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    image: {
      type: String,
      required: true,
    },
    benefits: {
      type: String,
      required: true,
    },

    requirements: {
      type: [String],
      default: [],
    },

    coursetype: {
      type: String,
      enum: ["Public", "Draft"],
    },

    courseContent: {
      type: {
        topics: [topicSchema],
      },
    },

    totalDuration: {
      type: String,
      defalut: "00:00:00",
    },

    averageRating: {
      type: Number,
      default: 0,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
