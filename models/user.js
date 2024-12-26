const { Timestamp } = require("mongodb");
const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    fname: {
      type: String,
      required: [true, "add the user first name"],
    },
    lname: {
      type: String,
      required: [true, "add the user last name"],
    },
    email: {
      type: String,
      required: [true, "add the user email"],
    },
    password: {
      type: String,
      required: [true, "add the user password"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
