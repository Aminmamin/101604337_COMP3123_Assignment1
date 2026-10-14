const express = require("express");
const auth = require("../middleware/auth");

const {
  getEmployees,
  createEmployee,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
} = require("../controllers/employeeController");

const {
  employeeValidation,
  employeeIdValidation,
  deleteIdValidation
} = require("../validators/employeeValidators");

const router = express.Router();

// Every employee endpoint requires a valid JWT.
router.use(auth);

router.get("/employees", getEmployees);

router.post(
  "/employees",
  employeeValidation,
  createEmployee
);

router.get(
  "/employees/:eid",
  employeeIdValidation,
  getEmployeeById
);

router.put(
  "/employees/:eid",
  employeeIdValidation,
  employeeValidation,
  updateEmployee
);

router.delete(
  "/employees",
  deleteIdValidation,
  deleteEmployee
);

module.exports = router;