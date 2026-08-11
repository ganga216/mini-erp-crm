require("dotenv/config");

const app = require("./app");

const PORT = process.env.PORT || 5000;


// =====================================================
// START SERVER
// =====================================================

const server = app.listen(PORT, () => {
  console.log(
    `🚀 Server running on http://localhost:${PORT}`
  );
});


// =====================================================
// HANDLE SERVER ERRORS
// =====================================================

server.on("error", (error) => {
  console.error("❌ Server error:", error);

  if (error.code === "EADDRINUSE") {
    console.error(
      `❌ Port ${PORT} is already in use.`
    );

    process.exit(1);
  }

  process.exit(1);
});


// =====================================================
// GRACEFUL SHUTDOWN
// =====================================================

const shutdown = (signal) => {
  console.log(
    `\n🛑 ${signal} received. Shutting down server...`
  );

  server.close(() => {
    console.log("✅ Server closed successfully.");
    process.exit(0);
  });
};


// =====================================================
// PROCESS SIGNALS
// =====================================================

process.on(
  "SIGINT",
  () => shutdown("SIGINT")
);

process.on(
  "SIGTERM",
  () => shutdown("SIGTERM")
);