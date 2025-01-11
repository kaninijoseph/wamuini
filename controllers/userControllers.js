const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "./env" });
const sendEmail = require("../middleware/sendEmail");
const crypto = require("crypto");
const Token = require("../models/token");

// Create a new user
// @route POST /api/users/register
// @access Public
const createUser = asyncHandler(async (req, res) => {
  try {
    const { email, fname, lname, password } = req.body;

    if (!email || !fname || !lname || !password) {
      res.status(400).json({ error: "All fields are mandatory." });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "user is already registered" });
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const user = await User.create({
      email,
      fname,
      lname,
      password: hashedPassword,
      isVerified: false, // Initially not verified
    });

    const token = await Token.create({
      userId: user._id,
      token: crypto.randomBytes(32).toString("hex"),
    });
    const url = `${process.env.BASE_URL}/api/users/${user._id}/verify/${token.token}`;

    await sendEmail(user.email, "verify Email", url);

    res
      .status(201)
      .json({ message: "An email sent to your account please verify" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error });
  }
});

//verify Email Token
//Get
const verifyEmailToken = asyncHandler(async (req, res) => {
  try {
    // Fetch user by ID
    const user = await User.findOne({ _id: req.params.id });
    if (!user) {
      return res.status(400).json({ message: "Invalid Link: User not found" });
    }

    // Check if the user is already verified
    if (user.isVerified) {
      return res.status(200).json({ message: "Email already verified" });
    }

    // Find the token associated with the user
    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token) {
      return res.status(400).json({ message: "Invalid Link: Token not found" });
    }

    // Verify the user and remove the token
    user.isVerified = true;
    await user.save();
    await Token.deleteOne({ _id: token._id });

    // res.redirect("http://localhost:5173/api/users/:id/verify/:token");
    return res.status(200).json({ message: "Email verification successful" });
  } catch (error) {
    console.error("Error during email verification:", error.message);
    return res.status(500).json({ message: "Failed to verify email" });
  }
});

//Delete a Registered User
//DELETE /api/user:id
const deleteUser = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  console.log(email);
  if (!user) {
    res.status(404);
    throw new Error("User does not exist");
  }

  await User.deleteOne({ email });
  res.status(200).json({ message: "User account deleted successfully" });
});

//Login user
//Post /api/users/login
//private
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "All fields are mandatory." });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  if (!user.isVerified) {
    const verificationToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.VERIFICATION_TOKEN_SECRET,
      { expiresIn: "60m" }
    );
    return res.status(302).json({
      message: "Please verify your email before logging in.",
      redirectUrl: `/verify-email?token=${verificationToken}`,
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ error: "Email or password is not valid." });
  }

  const accessToken = jwt.sign(
    {
      user: {
        email: user.email,
        id: user._id,
      },
    },
    process.env.ACESS_TOKEN_SECRET,
    { expiresIn: "6h" }
  );

  res.status(200).json({ accessToken, message: "Login successful." });
});

module.exports = { createUser, loginUser, deleteUser, verifyEmailToken };
