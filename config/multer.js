const path = require("path");
const multer = require("multer");
const fs = require("fs");

// Ensure directories exist
const createDirectory = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fileType = path.extname(file.originalname).toLowerCase();
    let folder = "uploads/";

    // Check file extension and determine folder (images or videos)
    if (fileType === ".jpeg" || fileType === ".jpg" || fileType === ".png") {
      folder += "images/";
    } else if (
      fileType === ".mp4" ||
      fileType === ".mkv" ||
      fileType === ".webm"
    ) {
      folder += "videos/";
    } else {
      // If file type is not supported
      return cb(
        new Error("Invalid file type. Only image and video files are allowed")
      );
    }

    // Create directory if it doesn't exist
    createDirectory(folder);

    cb(null, folder); // Specify the folder to save the file
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Save the file with unique name
  },
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|mp4|mkv|webm/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  // Ensure only valid file types are uploaded
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(
      new Error(
        "Error: File upload only supports the following filetypes - jpeg, jpg, png, mp4, mkv, webm"
      )
    );
  }
};

// Apply storage and fileFilter configurations
const upload = multer({ storage, fileFilter });

// Handle file upload under 'media' field
const handleUpload = upload.fields([{ name: "media", maxCount: 10 }]);

module.exports = handleUpload;
