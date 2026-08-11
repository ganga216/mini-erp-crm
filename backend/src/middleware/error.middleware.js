// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

const errorHandler = (
  err,
  req,
  res,
  next
) => {

  console.error(
    "Unhandled application error:",
    err
  );

  // -------------------------------------------------
  // If headers already sent, delegate to Express
  // -------------------------------------------------

  if (res.headersSent) {
    return next(err);
  }

  // -------------------------------------------------
  // Default status
  // -------------------------------------------------

  const statusCode =
    Number.isInteger(err.statusCode)
      ? err.statusCode
      : 500;

  // -------------------------------------------------
  // Production-safe response
  // -------------------------------------------------

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? "Internal server error"
        : err.message || "Request failed",
  });
};


// =====================================================
// NOT FOUND HANDLER
// =====================================================

const notFoundHandler = (
  req,
  res
) => {
  return res.status(404).json({
    success: false,
    message:
      `Route not found: ${req.method} ${req.originalUrl}`,
  });
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  errorHandler,
  notFoundHandler,
};