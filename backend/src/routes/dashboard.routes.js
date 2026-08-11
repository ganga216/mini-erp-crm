const express = require("express");

const router = express.Router();

const {
  getDashboardSummary,
  getDashboardDetails,
} = require("../controllers/dashboard.controller");

const {
  authenticateToken,
} = require("../middleware/auth.middleware");

const {
  authorizeRoles,
} = require("../middleware/role.middleware");

const {
  asyncHandler,
} = require("../middleware/asyncHandler");


// =====================================================
// DASHBOARD SUMMARY
// GET /api/dashboard/summary
// =====================================================

router.get(
  "/summary",
  authenticateToken,
  authorizeRoles(
    "ADMIN",
    "SALES",
    "WAREHOUSE",
    "ACCOUNTS"
  ),
  asyncHandler(getDashboardSummary)
);


// =====================================================
// DASHBOARD DETAILS
// GET /api/dashboard/details
// =====================================================

router.get(
  "/details",
  authenticateToken,
  authorizeRoles(
    "ADMIN",
    "SALES",
    "WAREHOUSE",
    "ACCOUNTS"
  ),
  asyncHandler(getDashboardDetails)
);


module.exports = router;