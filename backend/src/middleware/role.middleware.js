// =====================================================
// ROLE AUTHORIZATION MIDDLEWARE
// =====================================================

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {

    // -------------------------------------------------
    // Authentication must happen first
    // -------------------------------------------------

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // -------------------------------------------------
    // Normalize current user role
    // -------------------------------------------------

    const userRole = String(
      req.user.role || ""
    )
      .trim()
      .toUpperCase();

    // -------------------------------------------------
    // Normalize allowed roles
    // -------------------------------------------------

    const normalizedAllowedRoles =
      allowedRoles.map((role) =>
        String(role)
          .trim()
          .toUpperCase()
      );

    // -------------------------------------------------
    // Check authorization
    // -------------------------------------------------

    if (
      !normalizedAllowedRoles.includes(userRole)
    ) {
      console.log(
        "Authorization denied:",
        {
          userId: req.user.id,
          email: req.user.email,
          role: userRole,
          allowedRoles:
            normalizedAllowedRoles,
          method: req.method,
          path: req.originalUrl,
        }
      );

      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to access this resource",
      });
    }

    // -------------------------------------------------
    // Authorized
    // -------------------------------------------------

    next();
  };
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
  authorizeRoles,
};