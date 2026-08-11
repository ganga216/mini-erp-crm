const express = require("express");

const router = express.Router();

const {
  createFollowUp,
  getFollowUps,
  getFollowUpById,
} = require("../controllers/followup.controller");

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
// CREATE FOLLOW-UP
// POST /api/followups
// =====================================================

router.post(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "SALES"),
  asyncHandler(createFollowUp)
);


// =====================================================
// GET ALL FOLLOW-UPS
// GET /api/followups
// =====================================================

router.get(
  "/",
  authenticateToken,
  authorizeRoles(
    "ADMIN",
    "SALES",
    "WAREHOUSE",
    "ACCOUNTS"
  ),
  asyncHandler(getFollowUps)
);


// =====================================================
// GET FOLLOW-UP BY ID
// GET /api/followups/:id
// =====================================================

router.get(
  "/:id",
  authenticateToken,
  authorizeRoles(
    "ADMIN",
    "SALES",
    "WAREHOUSE",
    "ACCOUNTS"
  ),
  asyncHandler(getFollowUpById)
);


module.exports = router;