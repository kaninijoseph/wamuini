const express = require("express");
const {
  sendVerification_Email,
  verifyEmailToken,
} = require("../controllers/emailControllers");
const router = express.Router();

router.post("/verify-email", sendVerification_Email);

router.post("/verify-email-token", verifyEmailToken);

module.exports = router;
