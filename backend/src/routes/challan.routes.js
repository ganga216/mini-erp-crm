const express = require("express");

const router = express.Router();

const {
  createChallan,
  getChallans,
  getChallanById,
  addChallanItem,
  confirmChallan,
  cancelChallan,
} = require("../controllers/challan.controller");

const {
  authenticateToken,
} = require("../middleware/auth.middleware");

const {
  authorizeRoles,
} = require("../middleware/role.middleware");


// =====================================================
// CREATE DRAFT CHALLAN
// POST /api/challans
// =====================================================

router.post(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "SALES", "WAREHOUSE"),
  createChallan
);


// =====================================================
// GET ALL CHALLANS
// GET /api/challans
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
  getChallans
);


// =====================================================
// ADD ITEM TO CHALLAN
// POST /api/challans/:id/items
// =====================================================

router.post(
  "/:id/items",
  authenticateToken,
  authorizeRoles("ADMIN", "SALES", "WAREHOUSE"),
  addChallanItem
);


// =====================================================
// CONFIRM CHALLAN
// POST /api/challans/:id/confirm
// =====================================================

router.post(
  "/:id/confirm",
  authenticateToken,
  authorizeRoles("ADMIN", "SALES", "WAREHOUSE"),
  confirmChallan
);


// =====================================================
// CANCEL CHALLAN
// POST /api/challans/:id/cancel
// =====================================================

router.post(
  "/:id/cancel",
  authenticateToken,
  authorizeRoles("ADMIN", "SALES", "WAREHOUSE"),
  cancelChallan
);


// =====================================================
// GET CHALLAN BY ID
// GET /api/challans/:id
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
  getChallanById
);


module.exports = router;