const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "./env" });

const validateToken = asyncHandler(async (req, res, next) => {
  let authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && authHeader.startsWith("Bearer")) {
    const token = authHeader.split(" ")[1];

    if (!token) {
      res.status(402);
      throw new Error("User is not authorized or token is missing");
    }

    jwt.verify(token, process.env.ACESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        console.log("Token verification failed:", err);

        return res.status(401).json({ error: "User is not authorized" });
      }
      req.user = decoded.user;
      console.log(decoded);
      next();
    });
  } else {
    res.status(401);
    throw new Error("User is not authorized or token is missing");
  }
});

module.exports = validateToken;
