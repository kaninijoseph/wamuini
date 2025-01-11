const express = require("express");
const sendVerification_Email = require("../controllers/emailControllers");
const router = express.Router();

router.get("/verify-email", sendVerification_Email);
