const express = require("express");
const checkLogin = require("../middlewares/checkLogin");
const isStudent = require("../middlewares/isStudent");
const { addRating, allRatings } = require("../controllers/Rating");
const router = express.Router();

router.post("/add-rating", checkLogin, isStudent, addRating);
router.get("/ratings", allRatings);

module.exports = router;