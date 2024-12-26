const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "./env" });

//create a user
//@router GET /api/user
//public
const createUser = asyncHandler(async (req, res) => {
  const { email, fname, lname, password } = req.body;
  if (!email || !fname || !lname || !password) {
    res.status(400);
    throw new Error("All fields are mandatory");
  }
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error("User is already Registered");
  }

  //Hash Password
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    email,
    fname,
    lname,
    password: hashedPassword,
  });
  console.log("User created succesfully");
  console.log(`${user}`);

  if (user) {
    res.status(201).json({ _id: user.id, email: user.email });
  } else {
    res.status(400);
    throw new Error("User data is not valid");
  }
});

//Delete a Registered User
//DELETE /api/user:id
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  console.log(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error("User does not exist");
  }

  if (user.id.toString() !== req.user.id) {
    res.status(403);
    throw new Error("User is not Authorized to perform such operation");
  }
  await User.deleteOne({ _id: req.user.id });
  res.status(200).json({ message: "User account deleted successfully" });
});

//Login user
//Post /api/users/login
//private
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw Error("All fields are mandatory.");
  }
  const user = await User.findOne({ email });
  if (user && (await bcrypt.compare(password, user.password))) {
    const accessToken = jwt.sign(
      {
        user: {
          email: user.email,
          id: user._id,
        },
      },
      process.env.ACESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ accessToken });
  } else {
    res.status(401);
    throw new Error("email or password is not valid");
  }
});

module.exports = { createUser, loginUser, deleteUser };
