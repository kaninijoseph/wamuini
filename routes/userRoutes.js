const {
  createUser,
  loginUser,
  deleteUser,
} = require("../controllers/userControllers");
const express = require("express");
const router = express.Router();

router.post("/signup", createUser);

router.post("/login", loginUser);

router.delete("/delete/account", deleteUser);
// router.use(validateToken).delete("/delete/account", deleteUser);

module.exports = router;
