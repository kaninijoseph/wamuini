const {
  createUser,
  loginUser,
  deleteUser,
} = require("../controllers/userControllers");
const express = require("express");
const router = express.Router();
const validateToken = require("../middleware/validateTokenHandler");

router.post("/signup", createUser);

router.post("/login", loginUser);

router.delete("/delete/account", validateToken, deleteUser);
// router.use(validateToken).delete("/delete/account", deleteUser);

module.exports = router;
