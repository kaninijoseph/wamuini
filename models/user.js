const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    fname: {
      type: String,
      required: [true, "Add the user's first name"],
    },
    lname: {
      type: String,
      required: [true, "Add the user's last name"],
    },
    email: {
      type: String,
      required: [true, "Add the user's email"],
    },
    password: {
      type: String,
      required: [true, "Add the user's password"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Add virtual for full name
userSchema.virtual("name").get(function () {
  return `${this.fname} ${this.lname}`;
});

// Ensure virtuals are included in JSON responses
userSchema.set("toObject", { virtuals: true });
userSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("User", userSchema);
