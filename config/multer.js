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

    if (fileType === ".jpeg" || fileType === ".jpg" || fileType === ".png") {
      folder += "images/";
    } else if (fileType === ".mp4" || fileType === ".mkv") {
      folder += "videos/";
    }

    // Create directory if it doesn't exist
    createDirectory(folder);

    cb(null, folder);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|mp4|mkv/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(
      new Error(
        "Error: File upload only supports the following filetypes - " +
          filetypes
      )
    );
  }
};

const upload = multer({ storage, fileFilter });

const handleUpload = upload.fields([
  { name: "image", maxCount: 5 },
  { name: "video", maxCount: 5 },
]);

module.exports = handleUpload;
