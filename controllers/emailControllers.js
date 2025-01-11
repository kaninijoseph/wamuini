const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
const Token = require("../models/token");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const sendEmail = require("../middleware/sendEmail"); //

require("dotenv").config({ path: "./env" });

const sendVerificationEmail = async (user) => {
  // Generate token
  const token = await Token.create({
    userId: user._id,
    token: crypto.randomBytes(32).toString("hex"),
  });

  // Construct verification URL
  const url = `${process.env.BASE_URL}/api/users/${user._id}/verify/${token.token}`;

  // Send the email
  await sendEmail(user.email, "Verify Your Email", url);
};

const sendVerification_Email = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Token is required." });
  }

  // Verify the provided token to decode the user's information
  try {
    const decoded = jwt.verify(token, process.env.VERIFICATION_TOKEN_SECRET);
    const user = await User.findById(decoded.id); // Find the user using the decoded ID

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User is already verified" });
    }

    // Check if a verification token already exists for the user
    let checkToken = await Token.findOne({ userId: user._id });

    // If a token exists, check if it is expired
    if (checkToken) {
      const tokenExpiration = new Date(checkToken.tokenExpiration);

      if (tokenExpiration > new Date()) {
        // Token is valid, inform the user to check their email
        return res.status(200).json({
          message:
            "A verification email had already been sent. Please check your email.",
        });
      }

      // If the token is expired, delete it
      await Token.deleteOne({ userId: user._id });
    }

    const token = await Token.create({
      userId: user._id,
      token: crypto.randomBytes(32).toString("hex"),
    });

    const url = `${process.env.BASE_URL}/api/users/${user._id}/verify/${token.token}`;

    // Send the verification email
    await sendEmail(user.email, "Verify Your Email", url);

    res
      .status(200)
      .json({ message: "Verification email sent. Please check your email." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while processing your request." });
  }
});

module.exports = sendVerification_Email;
