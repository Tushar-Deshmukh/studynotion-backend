const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  phoneNumber: Number,
  message: String,
});

module.exports = mongoose.model("Contact", contactSchema);
