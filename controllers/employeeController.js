const Employee = require("../models/Employee");
const logger = require("../utils/logger");

function employeeData(body) {
  return {
    first_name: body.first_name,
    last_name: body.last_name,
    email: body.email,
    position: body.position,
    salary: body.salary,
    date_of_joining: body.date_of_joining,
    department: body.department
  };
}

async function checkOwnership(eid, userId, res) {
  const employee = await Employee.findById(eid).select("user");

  if (!employee) {
    res.status(404).json({
      success: false,
      message: "Employee not found"
    });
    return false;
  }

  if (!employee.user.equals(userId)) {
    logger.warn("Employee access rejected: incorrect owner");

    res.status(403).json({
      success: false,
      message: "You cannot access another user's employee"
    });
    return false;
  }

  return true;
}

async function getEmployees(req, res, next) {
  try {
    const employees = await Employee.find({
      user: req.user._id
    }).sort({ created_at: -1 });

    return res.status(200).json({
      success: true,
      employees
    });
  } catch (error) {
    next(error);
  }
}

async function createEmployee(req, res, next) {
  try {
    const employee = await Employee.create({
      ...employeeData(req.body),
      user: req.user._id
    });

    logger.info("Employee created");

    return res.status(201).json({
      success: true,
      message: "Employee created successfully",
      employee
    });
  } catch (error) {
    next(error);
  }
}

async function getEmployeeById(req, res, next) {
  try {
    const { eid } = req.params;

    if (!(await checkOwnership(eid, req.user._id, res))) {
      return;
    }

    const employee = await Employee.findOne({
      _id: eid,
      user: req.user._id
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    return res.status(200).json({
      success: true,
      employee
    });
  } catch (error) {
    next(error);
  }
}

async function updateEmployee(req, res, next) {
  try {
    const { eid } = req.params;

    if (!(await checkOwnership(eid, req.user._id, res))) {
      return;
    }

    const employee = await Employee.findOneAndUpdate(
      { _id: eid, user: req.user._id },
      { $set: employeeData(req.body) },
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    logger.info("Employee updated");

    return res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      employee
    });
  } catch (error) {
    next(error);
  }
}

async function deleteEmployee(req, res, next) {
  try {
    const { eid } = req.query;

    if (!(await checkOwnership(eid, req.user._id, res))) {
      return;
    }

    const employee = await Employee.findOneAndDelete({
      _id: eid,
      user: req.user._id
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    logger.info("Employee deleted");

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getEmployees,
  createEmployee,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
};