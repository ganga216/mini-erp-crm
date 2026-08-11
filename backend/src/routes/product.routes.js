const express = require("express");

const router = express.Router();

const {
  createProduct,
  updateProduct,
  getProducts,
  getProductById,
  getLowStockProducts,
} = require("../controllers/product.controller");

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
// CREATE PRODUCT
// POST /api/products
// =====================================================

router.post(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "WAREHOUSE"),
  asyncHandler(createProduct)
);


// =====================================================
// GET LOW-STOCK PRODUCTS
// GET /api/products/low-stock
// =====================================================
//
// IMPORTANT:
// This route must come before /:id.
// Otherwise "low-stock" could be interpreted as an ID.
//

router.get(
  "/low-stock",
  authenticateToken,
  authorizeRoles(
    "ADMIN",
    "WAREHOUSE",
    "ACCOUNTS"
  ),
  asyncHandler(getLowStockProducts)
);


// =====================================================
// GET ALL PRODUCTS
// GET /api/products
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
  asyncHandler(getProducts)
);


// =====================================================
// UPDATE PRODUCT
// PUT /api/products/:id
// =====================================================

router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("ADMIN", "WAREHOUSE"),
  asyncHandler(updateProduct)
);


// =====================================================
// GET PRODUCT BY ID
// GET /api/products/:id
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
  asyncHandler(getProductById)
);


// =====================================================
// EXPORT
// =====================================================

module.exports = router;