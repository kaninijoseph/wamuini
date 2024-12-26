const express = require("express");
const validateToken = require("../middleware/validateTokenHandler");
const createPost = require("../controllers/postContollers");
const handleUpload = require("../config/multer");

const router = express.Router();
router.use(validateToken);
router.post(
  "/create",
  handleUpload,
  (req, res, next) => {
    console.log("Body:", req.body);
    console.log("Files:", req.files);
    next();
  },
  createPost
);

module.exports = router;
