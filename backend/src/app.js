const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const customerRoutes = require("./routes/customer.routes");
const followupRoutes = require("./routes/followup.routes");
const productRoutes = require("./routes/product.routes");
const stockRoutes = require("./routes/stock.routes");
const challanRoutes = require("./routes/challan.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

const {
  notFoundHandler,
  errorHandler,
} = require("./middleware/error.middleware");

const app = express();


// =====================================================
// GLOBAL MIDDLEWARE
// =====================================================

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (
        origin.includes("localhost") ||
        origin.endsWith(".vercel.app") ||
        origin === process.env.FRONTEND_URL ||
        process.env.FRONTEND_URL === "*"
      ) {
        return callback(null, true);
      }

      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "1mb",
  })
);


// =====================================================
// HEALTH CHECK
// =====================================================

app.get(
  "/api/health",
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Mini ERP CRM API is running",
    });
  }
);


// =====================================================
// AUTHENTICATION
// =====================================================

app.use(
  "/api/auth",
  authRoutes
);


// =====================================================
// CUSTOMERS
// =====================================================

app.use(
  "/api/customers",
  customerRoutes
);


// =====================================================
// FOLLOW-UPS
// =====================================================

app.use(
  "/api/followups",
  followupRoutes
);


// =====================================================
// PRODUCTS
// =====================================================

app.use(
  "/api/products",
  productRoutes
);


// =====================================================
// STOCK
// =====================================================

app.use(
  "/api/products",
  stockRoutes
);


// =====================================================
// CHALLANS
// =====================================================

app.use(
  "/api/challans",
  challanRoutes
);


// =====================================================
// DASHBOARD
// =====================================================

app.use(
  "/api/dashboard",
  dashboardRoutes
);


// =====================================================
// 404 HANDLER
// IMPORTANT: Must be AFTER all routes
// =====================================================

app.use(
  notFoundHandler
);


// =====================================================
// GLOBAL ERROR HANDLER
// IMPORTANT: Must be LAST
// =====================================================

app.use(
  errorHandler
);


// =====================================================
// EXPORT
// =====================================================

module.exports = app;