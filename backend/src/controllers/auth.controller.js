const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const {
  PrismaClient,
} = require("../../prisma/generated/client");

const {
  PrismaPg,
} = require("@prisma/adapter-pg");


// =====================================================
// PRISMA CLIENT
// =====================================================

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});


// =====================================================
// LOGIN
// POST /api/auth/login
// =====================================================

const login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    // -------------------------------------------------
    // Validate input
    // -------------------------------------------------

    if (
      !email ||
      typeof email !== "string" ||
      !password ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    // -------------------------------------------------
    // Find user
    // -------------------------------------------------

    const user =
      await prisma.user.findUnique({
        where: {
          email: normalizedEmail,
        },
      });

    // -------------------------------------------------
    // Don't reveal whether email exists
    // -------------------------------------------------

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    // -------------------------------------------------
    // Verify password
    // -------------------------------------------------

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.passwordHash
      );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
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
    // Normalize role
    // -------------------------------------------------

    const normalizedRole =
      String(user.role)
        .trim()
        .toUpperCase();

    // -------------------------------------------------
    // Create JWT
    // -------------------------------------------------

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: normalizedRole,
      },
      jwtSecret,
      {
        expiresIn: "1h",
      }
    );

    // -------------------------------------------------
    // Response
    // -------------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Login successful",

      token,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: normalizedRole,
      },
    });

  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  login,
};