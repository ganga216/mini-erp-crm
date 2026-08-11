const jwt = require("jsonwebtoken");

// =====================================================
// AUTHENTICATE JWT TOKEN
// =====================================================

const authenticateToken = (
  req,
  res,
  next
) => {
  try {
    // -------------------------------------------------
    // Get Authorization header
    // -------------------------------------------------

    const authHeader =
      req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message:
          "Access token is required",
      });
    }

    // -------------------------------------------------
    // Expected:
    //
    // Authorization: Bearer <token>
    // -------------------------------------------------

    const parts =
      authHeader.trim().split(/\s+/);

    if (parts.length !== 2) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid authorization header",
      });
    }

    const [
      scheme,
      token,
    ] = parts;

    if (
      scheme.toLowerCase() !== "bearer"
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Authorization scheme must be Bearer",
      });
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          "Access token is required",
      });
    }

    // -------------------------------------------------
    // JWT secret
    // -------------------------------------------------

    const jwtSecret =
      process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error(
        "JWT_SECRET is not configured"
      );

      return res.status(500).json({
        success: false,
        message:
          "Authentication configuration error",
      });
    }

    // -------------------------------------------------
    // Verify JWT
    // -------------------------------------------------

    const decoded =
      jwt.verify(
        token,
        jwtSecret
      );

    // -------------------------------------------------
    // Validate JWT payload
    // -------------------------------------------------

    if (
      !decoded.userId ||
      !decoded.email ||
      !decoded.role
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid token payload",
      });
    }

    // -------------------------------------------------
    // Attach authenticated user
    // -------------------------------------------------

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: String(decoded.role)
        .trim()
        .toUpperCase(),
    };

    // -------------------------------------------------
    // Continue
    // -------------------------------------------------

    next();

  } catch (error) {
    console.error(
      "Authentication error:",
      error.message
    );

    // -------------------------------------------------
    // Expired token
    // -------------------------------------------------

    if (
      error.name ===
      "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Token has expired",
      });
    }

    // -------------------------------------------------
    // Invalid JWT
    // -------------------------------------------------

    if (
      error.name ===
      "JsonWebTokenError"
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid or expired token",
      });
    }

    // -------------------------------------------------
    // Other errors
    // -------------------------------------------------

    return res.status(401).json({
      success: false,
      message:
        "Authentication failed",
    });
  }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
  authenticateToken,
};