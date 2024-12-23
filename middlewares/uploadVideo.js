
const multer = require("multer");
const path = require("path");

// Configure multer for video uploads
const videoStorage = multer.diskStorage({
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });
  
  const uploadVideo = multer({
    storage: videoStorage,
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      if (![".mp4", ".avi", ".mkv", ".mov"].includes(ext)) {
        return cb(new Error("Only video files are allowed"));
      }
      cb(null, true);
    },
  });
  
  // Export multer upload for use in the route
  exports.uploadVideoMiddleware = uploadVideo.single("video");