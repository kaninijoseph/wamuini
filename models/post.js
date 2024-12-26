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
    imagePath: [{ type: String }],
    videoPath: [{ type: String }],
    fileType: {
      type: String,
      enum: ["image", "video", "none"],
      default: "none",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Post", postSchema);
