const express = require("express");

const router = express.Router();

const {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
} = require("../controllers/customer.controller");

const {
  authenticateToken,
} = require("../middleware/auth.middleware");

const {
  authorizeRoles,
} = require("../middleware/role.middleware");

const {
  asyncHandler,
} = require("../middleware/asyncHandler");


// CREATE CUSTOMER
router.post(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "SALES"),
  asyncHandler(createCustomer)
);


// GET ALL CUSTOMERS
router.get(
  "/",
  authenticateToken,
  authorizeRoles(
    "ADMIN",
    "SALES",
    "WAREHOUSE",
    "ACCOUNTS"
  ),
  asyncHandler(getCustomers)
);


// GET CUSTOMER BY ID
router.get(
  "/:id",
  authenticateToken,
  authorizeRoles(
    "ADMIN",
    "SALES",
    "WAREHOUSE",
    "ACCOUNTS"
  ),
  asyncHandler(getCustomerById)
);


// UPDATE CUSTOMER
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("ADMIN", "SALES"),
  asyncHandler(updateCustomer)
);


module.exports = router;