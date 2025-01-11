const mongoose = require("mongoose");

const commentSchema = mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    post_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Post",
    },
    text: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Comment", commentSchema);
