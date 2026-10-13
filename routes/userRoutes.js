const express = require("express");
const { signup, login } = require("../controllers/userController");
const {
  signupValidation,
  loginValidation
} = require("../validators/userValidators");

const router = express.Router();

router.post("/signup", signupValidation, signup);
router.post("/login", loginValidation, login);

module.exports = router;