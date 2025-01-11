const mongoose = require("mongoose");

const likeSchema = mongoose.Schema(
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Like", likeSchema);
