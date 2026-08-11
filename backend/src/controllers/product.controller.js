const prisma = require("../lib/prisma");

// =====================================================
// CREATE PRODUCT
// POST /api/products
// =====================================================

const createProduct = async (req, res) => {
  try {
    const {
      name,
      sku,
      category,
      unitPrice,
      currentStock,
      minimumStock,
      warehouseLocation,
    } = req.body;

    // -------------------------------------------------
    // Validate name
    // -------------------------------------------------

    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Product name is required",
      });
    }

    // -------------------------------------------------
    // Validate SKU
    // -------------------------------------------------

    if (!sku || sku.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "SKU is required",
      });
    }

    // -------------------------------------------------
    // Validate unit price
    // -------------------------------------------------

    const parsedUnitPrice = Number(unitPrice);

    if (
      !Number.isFinite(parsedUnitPrice) ||
      parsedUnitPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Unit price must be a valid non-negative number",
      });
    }

    // -------------------------------------------------
    // Validate current stock
    // -------------------------------------------------

    const parsedCurrentStock =
      currentStock === undefined
        ? 0
        : Number(currentStock);

    if (
      !Number.isInteger(parsedCurrentStock) ||
      parsedCurrentStock < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Current stock must be a non-negative integer",
      });
    }

    // -------------------------------------------------
    // Validate minimum stock
    // -------------------------------------------------

    const parsedMinimumStock =
      minimumStock === undefined
        ? 0
        : Number(minimumStock);

    if (
      !Number.isInteger(parsedMinimumStock) ||
      parsedMinimumStock < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Minimum stock must be a non-negative integer",
      });
    }

    // -------------------------------------------------
    // Check duplicate SKU
    // -------------------------------------------------

    const existingProduct = await prisma.product.findUnique({
      where: {
        sku: sku.trim(),
      },
    });

    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: "A product with this SKU already exists",
      });
    }

    // -------------------------------------------------
    // Create product
    // -------------------------------------------------

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        sku: sku.trim(),
        category: category?.trim() || null,
        unitPrice: parsedUnitPrice,
        currentStock: parsedCurrentStock,
        minimumStock: parsedMinimumStock,
        warehouseLocation:
          warehouseLocation?.trim() || null,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
};


// =====================================================
// GET ALL PRODUCTS
// GET /api/products
// =====================================================

const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};


// =====================================================
// GET PRODUCT BY ID
// GET /api/products/:id
// =====================================================

const getProductById = async (req, res) => {
  try {
    const productId = Number(req.params.id);

    // -------------------------------------------------
    // Validate product ID
    // -------------------------------------------------

    if (!Number.isInteger(productId) || productId <= 0) {
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
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get product error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
};


// =====================================================
// GET LOW-STOCK PRODUCTS
// GET /api/products/low-stock
// =====================================================

const getLowStockProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        currentStock: "asc",
      },
    });

    // A product is considered low stock when
    // currentStock <= minimumStock

    const lowStockProducts = products.filter(
      (product) =>
        product.currentStock <= product.minimumStock
    );

    return res.status(200).json({
      success: true,
      count: lowStockProducts.length,
      products: lowStockProducts,
    });
  } catch (error) {
    console.error("Get low-stock products error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch low-stock products",
    });
  }
};


// =====================================================
// UPDATE PRODUCT
// PUT /api/products/:id
// =====================================================

const updateProduct = async (req, res) => {
  try {
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const {
      name,
      sku,
      category,
      unitPrice,
      minimumStock,
      warehouseLocation,
    } = req.body;

    const updateData = {};

    if (name !== undefined) {
      if (!name || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Product name cannot be empty",
        });
      }
      updateData.name = name.trim();
    }

    if (sku !== undefined) {
      if (!sku || sku.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "SKU cannot be empty",
        });
      }
      const duplicate = await prisma.product.findFirst({
        where: {
          sku: sku.trim(),
          NOT: { id: productId },
        },
      });
      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "A product with this SKU already exists",
        });
      }
      updateData.sku = sku.trim();
    }

    if (category !== undefined) {
      updateData.category = category?.trim() || null;
    }

    if (unitPrice !== undefined) {
      const parsedPrice = Number(unitPrice);
      if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({
          success: false,
          message: "Unit price must be a valid non-negative number",
        });
      }
      updateData.unitPrice = parsedPrice;
    }

    if (minimumStock !== undefined) {
      const parsedMin = Number(minimumStock);
      if (!Number.isInteger(parsedMin) || parsedMin < 0) {
        return res.status(400).json({
          success: false,
          message: "Minimum stock must be a non-negative integer",
        });
      }
      updateData.minimumStock = parsedMin;
    }

    if (warehouseLocation !== undefined) {
      updateData.warehouseLocation = warehouseLocation?.trim() || null;
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createProduct,
  updateProduct,
  getProducts,
  getProductById,
  getLowStockProducts,
};