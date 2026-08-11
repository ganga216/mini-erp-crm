const prisma = require("../lib/prisma");

// =====================================================
// CREATE STOCK MOVEMENT
// POST /api/products/:id/stock
// =====================================================

const createStockMovement = async (req, res) => {
  const productId = Number(req.params.id);

  const {
    quantity,
    movementType,
    reason,
  } = req.body;

  // -------------------------------------------------
  // Validate product ID
  // -------------------------------------------------

  if (
    !Number.isInteger(productId) ||
    productId <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID",
    });
  }

  // -------------------------------------------------
  // Validate quantity
  // -------------------------------------------------

  const parsedQuantity = Number(quantity);

  if (
    !Number.isInteger(parsedQuantity) ||
    parsedQuantity <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Quantity must be a positive integer",
    });
  }

  // -------------------------------------------------
  // Validate movement type
  // -------------------------------------------------

  if (!["IN", "OUT"].includes(movementType)) {
    return res.status(400).json({
      success: false,
      message: "movementType must be either IN or OUT",
    });
  }

  // -------------------------------------------------
  // Validate reason
  // -------------------------------------------------

  if (
    !reason ||
    typeof reason !== "string" ||
    reason.trim().length === 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Reason is required",
    });
  }

  // -------------------------------------------------
  // Verify product exists
  // -------------------------------------------------

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  // =================================================
  // STOCK IN
  // =================================================

  if (movementType === "IN") {
    const result = await prisma.$transaction(
      async (tx) => {
        const movement =
          await tx.stockMovement.create({
            data: {
              productId,
              quantity: parsedQuantity,
              movementType: "IN",
              reason: reason.trim(),
              createdBy: req.user.email,
            },
          });

        const updatedProduct =
          await tx.product.update({
            where: {
              id: productId,
            },
            data: {
              currentStock: {
                increment: parsedQuantity,
              },
            },
          });

        return {
          movement,
          product: updatedProduct,
        };
      }
    );

    return res.status(201).json({
      success: true,
      message: "Stock IN movement created successfully",
      movement: result.movement,
      product: result.product,
    });
  }

  // =================================================
  // STOCK OUT
  // =================================================
  //
  // The important part is the conditional update:
  //
  // currentStock >= requested quantity
  //
  // This makes the stock deduction atomic.
  // =================================================

  const result = await prisma.$transaction(
    async (tx) => {
      const updatedProduct =
        await tx.product.updateMany({
          where: {
            id: productId,
            currentStock: {
              gte: parsedQuantity,
            },
          },
          data: {
            currentStock: {
              decrement: parsedQuantity,
            },
          },
        });

      // ---------------------------------------------
      // No row updated = insufficient stock
      // ---------------------------------------------

      if (updatedProduct.count === 0) {
        return {
          insufficientStock: true,
        };
      }

      // ---------------------------------------------
      // Create OUT movement only after successful
      // stock deduction
      // ---------------------------------------------

      const movement =
        await tx.stockMovement.create({
          data: {
            productId,
            quantity: parsedQuantity,
            movementType: "OUT",
            reason: reason.trim(),
            createdBy: req.user.email,
          },
        });

      // ---------------------------------------------
      // Fetch updated product
      // ---------------------------------------------

      const productAfterUpdate =
        await tx.product.findUnique({
          where: {
            id: productId,
          },
        });

      return {
        insufficientStock: false,
        movement,
        product: productAfterUpdate,
      };
    }
  );

  // -------------------------------------------------
  // Insufficient stock response
  // -------------------------------------------------

  if (result.insufficientStock) {
    const currentProduct =
      await prisma.product.findUnique({
        where: {
          id: productId,
        },
        select: {
          currentStock: true,
        },
      });

    return res.status(400).json({
      success: false,
      message: "Insufficient stock",
      currentStock:
        currentProduct?.currentStock ?? 0,
      requestedQuantity: parsedQuantity,
    });
  }

  // -------------------------------------------------
  // Success response
  // -------------------------------------------------

  return res.status(201).json({
    success: true,
    message: "Stock OUT movement created successfully",
    movement: result.movement,
    product: result.product,
  });
};


// =====================================================
// GET STOCK MOVEMENTS FOR PRODUCT
// GET /api/products/:id/stock
// =====================================================

const getStockMovements = async (req, res) => {
  const productId = Number(req.params.id);

  // -------------------------------------------------
  // Validate product ID
  // -------------------------------------------------

  if (
    !Number.isInteger(productId) ||
    productId <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID",
    });
  }

  // -------------------------------------------------
  // Find product
  // -------------------------------------------------

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    select: {
      id: true,
      name: true,
      sku: true,
      currentStock: true,
      minimumStock: true,
      warehouseLocation: true,
    },
  });

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  // -------------------------------------------------
  // Get movements
  // -------------------------------------------------

  const movements =
    await prisma.stockMovement.findMany({
      where: {
        productId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  return res.status(200).json({
    success: true,
    product,
    count: movements.length,
    movements,
  });
};


// =====================================================
// GET ALL STOCK MOVEMENTS
// GET /api/products/stock/movements
// =====================================================

const getAllStockMovements = async (req, res) => {
  const movements =
    await prisma.stockMovement.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  return res.status(200).json({
    success: true,
    count: movements.length,
    movements,
  });
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createStockMovement,
  getStockMovements,
  getAllStockMovements,
};