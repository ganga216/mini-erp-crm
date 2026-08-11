const express = require("express");

const router = express.Router();

const {
  createStockMovement,
  getStockMovements,
  getAllStockMovements,
} = require("../controllers/stock.controller");

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
// GET ALL STOCK MOVEMENTS
// GET /api/products/stock/movements
// =====================================================

router.get(
  "/stock/movements",
  authenticateToken,
  authorizeRoles(
    "ADMIN",
    "SALES",
    "WAREHOUSE",
    "ACCOUNTS"
  ),
  asyncHandler(getAllStockMovements)
);


// =====================================================
// CREATE STOCK MOVEMENT
// POST /api/products/:id/stock
// =====================================================

router.post(
  "/:id/stock",
  authenticateToken,
  authorizeRoles(
    "ADMIN",
    "WAREHOUSE"
  ),
  asyncHandler(createStockMovement)
);


// =====================================================
// GET STOCK MOVEMENTS FOR PRODUCT
// GET /api/products/:id/stock
// =====================================================

router.get(
  "/:id/stock",
  authenticateToken,
  authorizeRoles(
    "ADMIN",
    "SALES",
    "WAREHOUSE",
    "ACCOUNTS"
  ),
  asyncHandler(getStockMovements)
);


module.exports = router;