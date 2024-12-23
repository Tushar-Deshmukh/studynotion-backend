const mongoose = require("mongoose");

const courseSubTopicSchema = new mongoose.Schema({
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
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CourseTopic",
  },
});

const CourseSubTopic = mongoose.model("CourseSubTopic", courseSubTopicSchema);

module.exports = CourseSubTopic;
