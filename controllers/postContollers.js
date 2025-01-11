const asyncHandler = require("express-async-handler");
const Post = require("../models/post");
const User = require("../models/user");
const Comment = require("../models/comments");
const Like = require("../models/likes");
const { wss } = require("../index");
const path = require("path");
require("dotenv").config({ path: "./env" });

// Broadcast message to all connected clients
const broadcast = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

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
    console.log("Post saved", post);
    res.status(201).json(post);
  } catch (error) {
    console.log("Error saving post", error);
    res.status(400).json({ error: error.message });
  }
});

//Get all Posts
const getPosts = asyncHandler(async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("user_id", "fname lname"); // Populate fname and lname from User model

    // Loop through each post and add 'name' field
    for (const post of posts) {
      post.name = `${post.user_id.fname} ${post.user_id.lname}`;

      post.likes = await Like.find({ post_id: post._id }).populate(
        "user_id",
        "username"
      );
      post.comments = await Comment.find({ post_id: post._id }).populate(
        "user_id",
        "username"
      );

      // Process image and video paths
      post.imagePaths = post.imagePaths.map(
        (imagePath) => `/uploads/images/${path.basename(imagePath)}`
      );
      post.videoPaths = post.videoPaths.map(
        (videoPath) => `/uploads/videos/${path.basename(videoPath)}`
      );

      post.media = [
        ...post.imagePaths.map((path) => ({ type: "image", path })),
        ...post.videoPaths.map((path) => ({ type: "video", path })),
      ];
    }

    res.status(200).json(posts); // Send posts with the added 'name'
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//Add a Comment
const addComent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const userId = req.user.id;

  try {
    const comment = new Comment({
      post_id: id,
      user_id: userId,
      text,
    });

    await comment.save();

    const post = await Post.findById(id);
    broadcast({ type: "UPDATE_POST", post });
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//Delete a Comment
const deleteComment = asyncHandler(async (res, req) => {
  const { postId, commentId } = req.params;
  const userId = req.user.id;

  try {
    const comment = await Comment.findOneAndDelete({
      _id: commentId,
      post_id: postId,
      user_id: userId,
    });

    if (!comment) {
      return res
        .status(404)
        .json({ error: "Comment not found or not authorized" });
    }

    const post = await Post.findById(postId);
    broadcast({ type: "UPDATE_POST", post }); //broadcast updated
    res.status(200).json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const likePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const like = await Like.findOne({ post_id: id, user_id: userId });

    if (like) {
      await like.remove();
    } else {
      await Like.create({ post_id: id, user_id: userId });
    }

    const likeCount = await Like.countDocuments({ post_id: id });
    const post = await Post.findById(id);
    broadcast({ type: "UPDATE_POST", post });
    res.status(200).json({ post, likeCount });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const GetPosts = asyncHandler(async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("user_id", "fname lname"); // Populate fname and lname from User model

    const postPromises = posts.map(async (post) => {
      const likes = await Like.find({ post_id: post._id }).populate(
        "user_id",
        "username"
      );

      const comments = await Comment.find({ post_id: post._id }).populate(
        "user_id",
        "username"
      );

      const media = [
        ...post.imagePaths.map((imagePath) => ({
          type: "image",
          path: `/uploads/images/${path.basename(imagePath)}`,
        })),
        ...post.videoPaths.map((videoPath) => ({
          type: "video",
          path: `/uploads/videos/${path.basename(videoPath)}`,
        })),
      ];

      return {
        id: post._id,
        text: post.text,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        name: `${post.user_id.fname} ${post.user_id.lname}`,
        likes,
        comments,
        media,
      };
    });

    const enrichedPosts = await Promise.all(postPromises);

    res.status(200).json(enrichedPosts);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = {
  createPost,
  getPosts,
  likePost,
  addComent,
  deleteComment,
  GetPosts,
};
