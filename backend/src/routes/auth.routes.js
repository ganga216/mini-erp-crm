const express = require("express");

const { login } = require("../controllers/auth.controller");
const { authenticateToken } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

const router = express.Router();

// Login
router.post("/login", login);

// Test authentication
router.get("/me", authenticateToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Authenticated user",
    user: req.user,
  });
});

// Test ADMIN role
router.get(
  "/admin-test",
  authenticateToken,
  authorizeRoles("ADMIN"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Welcome Admin! You have access to this route.",
    });
  }
);

module.exports = router;