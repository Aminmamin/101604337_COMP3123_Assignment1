const { body, validationResult } = require("express-validator");

function checkValidation(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg
      }))
    });
  }

  next();
}

const signupValidation = [
  body("username")
    .isString()
    .withMessage("Username must be text")
    .bail()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must contain 3–30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can contain letters, numbers and underscores"),

  body("email")
    .isString()
    .withMessage("Email must be text")
    .bail()
    .trim()
    .isLength({ max: 254 })
    .isEmail()
    .withMessage("Enter a valid email")
    .toLowerCase(),

  body("password")
    .isString()
    .withMessage("Password must be text")
    .bail()
    .isLength({ min: 8 })
    .withMessage("Password must contain at least 8 characters")
    .custom((value) => Buffer.byteLength(value, "utf8") <= 72)
    .withMessage("Password must not exceed 72 bytes")
    .matches(/[a-z]/)
    .withMessage("Password needs a lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("Password needs an uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password needs a number"),

  checkValidation
];

const loginValidation = [
  body("username")
    .optional()
    .isString()
    .bail()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Enter a valid username"),

  body("email")
    .optional()
    .isString()
    .bail()
    .trim()
    .isLength({ max: 254 })
    .isEmail()
    .withMessage("Enter a valid email")
    .toLowerCase(),

  body("password")
    .isString()
    .withMessage("Password is required")
    .bail()
    .notEmpty()
    .withMessage("Password is required")
    .custom((value) => Buffer.byteLength(value, "utf8") <= 72)
    .withMessage("Password must not exceed 72 bytes"),

  body().custom((value) => {
    if (!value || (!value.username && !value.email)) {
      throw new Error("Provide a username or email");
    }

    if (value.username && value.email) {
      throw new Error("Provide either username or email");
    }

    return true;
  }),

  checkValidation
];

module.exports = {
  signupValidation,
  loginValidation,
  checkValidation
};