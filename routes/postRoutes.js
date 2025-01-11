const express = require("express");
const path = require("path");
const validateToken = require("../middleware/validateTokenHandler");
const {
  createPost,
  getPosts,
  addComent,
  deleteComment,
  likePost,
  GetPosts,
} = require("../controllers/postContollers");
const handleUpload = require("../config/multer");
const checkEmailVerification = require("../middleware/checkEmailVerification");

const router = express.Router();

router.use(validateToken);
router.use(checkEmailVerification);
router.use(express.static(path.join(__dirname, "uploads")));
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

router.get("/fetch", GetPosts);
router.post("/:id/comment", addComent);
router.post("/:postId/comment/:commentId", deleteComment);
router.post("/:id/like", likePost);

module.exports = router;
