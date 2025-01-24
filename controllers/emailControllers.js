const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
const Token = require("../models/token");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const sendEmail = require("../middleware/sendEmail");

require("dotenv").config({ path: "./env" });

const sendVerification_Email = asyncHandler(async (req, res) => {
  const { token: requestToken } = req.body; // Renaming the token from request body

  if (!requestToken) {
    return res.status(400).json({ message: "Token is required." });
  }

  // Verify the provided token to decode the user's information
  try {
    const decoded = jwt.verify(
      requestToken,
      process.env.VERIFICATION_TOKEN_SECRET
    );
    const user = await User.findById(decoded.id);

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

    const newToken = await Token.create({
      // Renaming the new token variable
      userId: user._id,
      token: crypto.randomBytes(32).toString("hex"),
    });

    const verificationToken = jwt.sign(
      { userId: user._id, dbToken: newToken.token },
      process.env.VERIFICATION_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    const url = `${process.env.BASE_URL}/verify-email-token?token=${verificationToken}`;

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

//verify Email Token
//Get
const verifyEmailToken = asyncHandler(async (req, res) => {
  const { token: verificationToken } = req.body;

  if (!verificationToken) {
    console.log("verification token is required.");
    return res
      .status(400)
      .json({ message: "Invalid email verification request" });
  }
  try {
    const decoded = jwt.verify(
      verificationToken,
      process.env.VERIFICATION_TOKEN_SECRET
    );
    const { userId, dbToken } = decoded;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "Invalid token: User not found" });
    }

    if (user.isVerified) {
      return res
        .status(400)
        .json({ message: "Email already verified. Login." });
    }

    // Find the token associated with the user
    const token = await Token.findOne({
      userId: user._id,
      token: dbToken,
    });
    if (!token) {
      return res.status(400).json({ message: "Invalid email Token." });
    }

    user.isVerified = true;
    await user.save();
    await Token.deleteOne({ _id: token._id });

    return res.status(200).json({ message: "Email verification successful" });
  } catch (error) {
    console.error("Error during email verification:", error.message);
    return res.status(500).json({ message: "Failed to verify email" });
  }
});

module.exports = { sendVerification_Email, verifyEmailToken };
