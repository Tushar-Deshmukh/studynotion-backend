const express = require("express");
const router = express.Router();

const { uploadImage , uploadVideo} = require("../controllers/upload");
const { uploadImageMiddleware } = require("../middlewares/uploadImage");
const {uploadVideoMiddleware} = require("../middlewares/uploadVideo")
 
router.post("/upload-image", uploadImageMiddleware, uploadImage);
router.post("/upload-video", uploadVideoMiddleware, uploadVideo);

module.exports = router;
