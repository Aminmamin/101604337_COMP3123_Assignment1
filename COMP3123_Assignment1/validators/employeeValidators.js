const { body, param, query } = require("express-validator");
const { checkValidation } = require("./userValidators");

const employeeFields = [
  "first_name",
  "last_name",
  "email",
  "position",
  "salary",
  "date_of_joining",
  "department"
];

const employeeValidation = [
  body().custom((value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("Request body must be a JSON object");
    }

    const unexpected = Object.keys(value).filter(
      (key) => !employeeFields.includes(key)
    );

    if (unexpected.length > 0) {
      throw new Error(`Unexpected fields: ${unexpected.join(", ")}`);
    }

    return true;
  }),

  ...["first_name", "last_name", "position", "department"].map(
    (field) =>
      body(field)
        .isString()
        .withMessage(`${field} must be text`)
        .bail()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage(`${field} must contain 1–100 characters`)
  ),

  body("email")
    .isString()
    .withMessage("Email must be text")
    .bail()
    .trim()
    .isLength({ max: 254 })
    .isEmail()
    .withMessage("Enter a valid email")
    .toLowerCase(),

  body("salary")
    .custom(
      (value) =>
        typeof value === "number" &&
        Number.isFinite(value) &&
        value > 0
    )
    .withMessage("Salary must be a positive JSON number"),

  body("date_of_joining")
    .isString()
    .withMessage("Date must be text")
    .bail()
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage("Enter a valid date, such as 2026-10-12"),

  checkValidation
];

const employeeIdValidation = [
  param("eid")
    .isMongoId()
    .withMessage("Invalid employee ID"),
  checkValidation
];

const deleteIdValidation = [
  query("eid")
    .isString()
    .withMessage("Provide one employee ID")
    .bail()
    .isMongoId()
    .withMessage("Invalid employee ID"),
  checkValidation
];

module.exports = {
  employeeValidation,
  employeeIdValidation,
  deleteIdValidation
};