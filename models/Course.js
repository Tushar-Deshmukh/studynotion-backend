const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
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

  coursetype:{
    type:String,
    enum:["Public","Draft"]
  },

  createdBy:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  }
},{timestamps:true});

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
