const { Timestamp } = require("mongodb");
const mongoose = require("mongoose");

const postSchema = mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    text: {
      type: String,
      required: false,
    },
    imagePaths: [{ type: String }],
    videoPaths: [{ type: String }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [
      {
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: { type: String, required: true },
      },
    ],
    fileType: {
      type: String,
      enum: ["file", "none"],
      default: "none",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Post", postSchema);
