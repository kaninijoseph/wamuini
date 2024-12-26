const asyncHandler = require("express-async-handler");
const Post = require("../models/post");

// Create post handler
const createPost = asyncHandler(async (req, res) => {
  const { text } = req.body;

  const imageFiles = req.files["image"]
    ? req.files["image"].map((file) => file.path)
    : [];
  const videoFiles = req.files["video"]
    ? req.files["video"].map((file) => file.path)
    : [];

  let fileType = "none";
  if (imageFiles.length > 0) fileType = "file";
  if (videoFiles.length > 0) fileType = "file";

  const post = new Post({
    user_id: req.user.id,
    text,
    imagePaths: imageFiles, // Save all image paths
    videoPaths: videoFiles, // Save all video paths
    fileType,
  });

  if (!text && imageFiles.length === 0 && videoFiles.length === 0) {
    return res
      .status(400)
      .json({ error: "Post must have at least text, image, or video" });
  }

  try {
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    console.log("Error saving post", error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = createPost;
