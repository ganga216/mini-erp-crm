const prisma = require("../lib/prisma");

// =====================================================
// CREATE DRAFT CHALLAN
// POST /api/challans
// =====================================================

const createChallan = async (req, res) => {
  const { customerId } = req.body;

  const parsedCustomerId = Number(customerId);

  if (
    !Number.isInteger(parsedCustomerId) ||
    parsedCustomerId <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Valid customerId is required",
    });
  }

  const customer = await prisma.customer.findUnique({
    where: {
      id: parsedCustomerId,
    },
  });

  if (!customer) {
    return res.status(404).json({
      success: false,
      message: "Customer not found",
    });
  }

  const lastChallan = await prisma.challan.findFirst({
    orderBy: {
      id: "desc",
    },
    select: {
      id: true,
    },
  });

  const nextNumber = (lastChallan?.id || 0) + 1;

  const challanNumber = `CH-${String(nextNumber).padStart(4, "0")}`;

  const challan = await prisma.challan.create({
    data: {
      challanNumber,
      customerId: parsedCustomerId,
      totalQuantity: 0,
      status: "DRAFT",
      createdBy: req.user.email,
    },
    include: {
      customer: {
        select: {
          id: true,
          customerName: true,
          mobile: true,
          email: true,
          businessName: true,
        },
      },
      items: true,
    },
  });

  return res.status(201).json({
    success: true,
    message: "Draft challan created successfully",
    challan,
  });
};


// =====================================================
// GET ALL CHALLANS
// GET /api/challans
// =====================================================

const getChallans = async (req, res) => {
  const challans = await prisma.challan.findMany({
    include: {
      customer: {
        select: {
          id: true,
          customerName: true,
          mobile: true,
          email: true,
          businessName: true,
        },
      },
      items: {
        select: {
          id: true,
          productId: true,
          productNameSnapshot: true,
          skuSnapshot: true,
          unitPriceSnapshot: true,
          quantity: true,
          totalPrice: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return res.status(200).json({
    success: true,
    count: challans.length,
    challans,
  });
};


// =====================================================
// GET CHALLAN BY ID
// GET /api/challans/:id
// =====================================================

const getChallanById = async (req, res) => {
  const challanId = Number(req.params.id);

  if (!Number.isInteger(challanId) || challanId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid challan ID",
    });
  }

  const challan = await prisma.challan.findUnique({
    where: {
      id: challanId,
    },
    include: {
      customer: {
        select: {
          id: true,
          customerName: true,
          mobile: true,
          email: true,
          businessName: true,
          gstNumber: true,
          customerType: true,
          address: true,
        },
      },
      items: {
        select: {
          id: true,
          challanId: true,
          productId: true,
          productNameSnapshot: true,
          skuSnapshot: true,
          unitPriceSnapshot: true,
          quantity: true,
          totalPrice: true,
        },
      },
    },
  });

  if (!challan) {
    return res.status(404).json({
      success: false,
      message: "Challan not found",
    });
  }

  return res.status(200).json({
    success: true,
    challan,
  });
};


// =====================================================
// ADD ITEM TO CHALLAN
// POST /api/challans/:id/items
// =====================================================

const addChallanItem = async (req, res) => {
  const challanId = Number(req.params.id);

  const {
    productId,
    quantity,
  } = req.body;

  // -------------------------------------------------
  // Validate challan ID
  // -------------------------------------------------

  if (!Number.isInteger(challanId) || challanId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid challan ID",
    });
  }

  // -------------------------------------------------
  // Validate product ID
  // -------------------------------------------------

  const parsedProductId = Number(productId);

  if (
    !Number.isInteger(parsedProductId) ||
    parsedProductId <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Valid productId is required",
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
  // Find challan
  // -------------------------------------------------

  const challan = await prisma.challan.findUnique({
    where: {
      id: challanId,
    },
  });

  if (!challan) {
    return res.status(404).json({
      success: false,
      message: "Challan not found",
    });
  }

  // -------------------------------------------------
  // Only DRAFT challans can be modified
  // -------------------------------------------------

  if (challan.status !== "DRAFT") {
    return res.status(400).json({
      success: false,
      message: "Only DRAFT challans can be modified",
    });
  }

  // -------------------------------------------------
  // Find product
  // -------------------------------------------------

  const product = await prisma.product.findUnique({
    where: {
      id: parsedProductId,
    },
  });

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  // -------------------------------------------------
  // Prevent duplicate product
  // -------------------------------------------------

  const existingItem = await prisma.challanItem.findFirst({
    where: {
      challanId: challanId,
      productId: parsedProductId,
    },
  });

  if (existingItem) {
    return res.status(409).json({
      success: false,
      message: "Product already exists in this challan",
      existingQuantity: existingItem.quantity,
    });
  }

  // -------------------------------------------------
  // Calculate total price
  // -------------------------------------------------

  const totalPrice = product.unitPrice * parsedQuantity;

  // -------------------------------------------------
  // Transaction
  // -------------------------------------------------

  const result = await prisma.$transaction(async (tx) => {
    const item = await tx.challanItem.create({
      data: {
        challanId: challanId,
        productId: parsedProductId,

        productNameSnapshot: product.name,
        skuSnapshot: product.sku,
        unitPriceSnapshot: product.unitPrice,

        quantity: parsedQuantity,
        totalPrice: totalPrice,
      },
    });

    const updatedChallan = await tx.challan.update({
      where: {
        id: challanId,
      },
      data: {
        totalQuantity: {
          increment: parsedQuantity,
        },
      },
    });

    return {
      item,
      challan: updatedChallan,
    };
  });

  return res.status(201).json({
    success: true,
    message: "Challan item added successfully",
    item: result.item,
    challan: result.challan,
  });
};


// =====================================================
// CONFIRM CHALLAN
// POST /api/challans/:id/confirm
// =====================================================

const confirmChallan = async (req, res) => {
  const challanId = Number(req.params.id);

  // -------------------------------------------------
  // Validate challan ID
  // -------------------------------------------------

  if (!Number.isInteger(challanId) || challanId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid challan ID",
    });
  }

  // -------------------------------------------------
  // Find challan with items
  // -------------------------------------------------

  const challan = await prisma.challan.findUnique({
    where: {
      id: challanId,
    },
    include: {
      items: true,
      customer: {
        select: {
          id: true,
          customerName: true,
          mobile: true,
          email: true,
          businessName: true,
        },
      },
    },
  });

  if (!challan) {
    return res.status(404).json({
      success: false,
      message: "Challan not found",
    });
  }

  // -------------------------------------------------
  // Only DRAFT challans can be confirmed
  // -------------------------------------------------

  if (challan.status !== "DRAFT") {
    return res.status(400).json({
      success: false,
      message: `Cannot confirm a ${challan.status.toLowerCase()} challan`,
    });
  }

  // -------------------------------------------------
  // Challan must contain items
  // -------------------------------------------------

  if (challan.items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Cannot confirm a challan without items",
    });
  }

  // -------------------------------------------------
  // Pre-check stock
  // -------------------------------------------------

  for (const item of challan.items) {
    const product = await prisma.product.findUnique({
      where: {
        id: item.productId,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found for challan item ${item.id}`,
      });
    }

    if (item.quantity > product.currentStock) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock for challan",
        product: {
          id: product.id,
          name: product.name,
          sku: product.sku,
          currentStock: product.currentStock,
          requestedQuantity: item.quantity,
        },
      });
    }
  }

  // -------------------------------------------------
  // Transaction
  // -------------------------------------------------

  const confirmedChallan = await prisma.$transaction(async (tx) => {
    for (const item of challan.items) {
      const product = await tx.product.findUnique({
        where: {
          id: item.productId,
        },
      });

      if (!product) {
        throw new Error(
          `Product ${item.productId} not found`
        );
      }

      if (item.quantity > product.currentStock) {
        throw new Error(
          `Insufficient stock for product ${product.name}`
        );
      }

      // Reduce stock
      await tx.product.update({
        where: {
          id: item.productId,
        },
        data: {
          currentStock: {
            decrement: item.quantity,
          },
        },
      });

      // Create stock OUT movement
      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          quantity: item.quantity,
          movementType: "OUT",
          reason: `Challan ${challan.challanNumber}`,
          createdBy: req.user.email,
        },
      });
    }

    // Change challan status
    const updatedChallan = await tx.challan.update({
      where: {
        id: challanId,
      },
      data: {
        status: "CONFIRMED",
      },
      include: {
        customer: {
          select: {
            id: true,
            customerName: true,
            mobile: true,
            email: true,
            businessName: true,
          },
        },
        items: true,
      },
    });

    return updatedChallan;
  });

  return res.status(200).json({
    success: true,
    message: "Challan confirmed successfully",
    challan: confirmedChallan,
  });
};


// =====================================================
// CANCEL CONFIRMED CHALLAN
// POST /api/challans/:id/cancel
// =====================================================

const cancelChallan = async (req, res) => {
  const challanId = Number(req.params.id);

  // -------------------------------------------------
  // Validate challan ID
  // -------------------------------------------------

  if (!Number.isInteger(challanId) || challanId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid challan ID",
    });
  }

  // -------------------------------------------------
  // Find challan with items
  // -------------------------------------------------

  const challan = await prisma.challan.findUnique({
    where: {
      id: challanId,
    },
    include: {
      items: true,
      customer: {
        select: {
          id: true,
          customerName: true,
          mobile: true,
          email: true,
          businessName: true,
        },
      },
    },
  });

  if (!challan) {
    return res.status(404).json({
      success: false,
      message: "Challan not found",
    });
  }

  // -------------------------------------------------
  // Only CONFIRMED challans can be cancelled
  // -------------------------------------------------

  if (challan.status !== "CONFIRMED") {
    return res.status(400).json({
      success: false,
      message: "Only CONFIRMED challans can be cancelled",
      currentStatus: challan.status,
    });
  }

  // -------------------------------------------------
  // Challan must contain items
  // -------------------------------------------------

  if (challan.items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Cannot cancel a challan with no items",
    });
  }

  // -------------------------------------------------
  // Transaction
  // -------------------------------------------------

  const result = await prisma.$transaction(async (tx) => {
    const stockMovements = [];

    for (const item of challan.items) {
      const product = await tx.product.findUnique({
        where: {
          id: item.productId,
        },
      });

      if (!product) {
        throw new Error(
          `Product ${item.productId} not found`
        );
      }

      // Restore stock
      const updatedProduct = await tx.product.update({
        where: {
          id: item.productId,
        },
        data: {
          currentStock: {
            increment: item.quantity,
          },
        },
      });

      // Create stock IN movement
      const movement = await tx.stockMovement.create({
        data: {
          productId: item.productId,
          quantity: item.quantity,
          movementType: "IN",
          reason: `Challan ${challan.challanNumber} cancelled - stock restored`,
          createdBy: req.user.email,
        },
      });

      stockMovements.push({
        movement,
        product: updatedProduct,
      });
    }

    // Change challan status
    const cancelledChallan = await tx.challan.update({
      where: {
        id: challanId,
      },
      data: {
        status: "CANCELLED",
      },
      include: {
        customer: {
          select: {
            id: true,
            customerName: true,
            mobile: true,
            email: true,
            businessName: true,
          },
        },
        items: true,
      },
    });

    return {
      challan: cancelledChallan,
      stockMovements,
    };
  });

  return res.status(200).json({
    success: true,
    message: "Challan cancelled successfully",
    challan: result.challan,
    stockMovements: result.stockMovements,
  });
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createChallan,
  getChallans,
  getChallanById,
  addChallanItem,
  confirmChallan,
  cancelChallan,
};