const prisma = require("../lib/prisma");

// =====================================================
// GET DASHBOARD SUMMARY
// GET /api/dashboard/summary
// =====================================================

const getDashboardSummary = async (req, res) => {
  const [
    totalCustomers,
    totalLeads,
    activeCustomers,
    inactiveCustomers,
    totalProducts,
    totalFollowUps,
    upcomingFollowUps,
    draftChallans,
    confirmedChallans,
    cancelledChallans,
    products,
  ] = await Promise.all([
    prisma.customer.count(),

    prisma.customer.count({
      where: {
        status: "LEAD",
      },
    }),

    prisma.customer.count({
      where: {
        status: "ACTIVE",
      },
    }),

    prisma.customer.count({
      where: {
        status: "INACTIVE",
      },
    }),

    prisma.product.count(),

    prisma.followUp.count(),

    prisma.followUp.count({
      where: {
        followUpDate: {
          gte: new Date(),
        },
      },
    }),

    prisma.challan.count({
      where: {
        status: "DRAFT",
      },
    }),

    prisma.challan.count({
      where: {
        status: "CONFIRMED",
      },
    }),

    prisma.challan.count({
      where: {
        status: "CANCELLED",
      },
    }),

    prisma.product.findMany({
      select: {
        currentStock: true,
        minimumStock: true,
      },
    }),
  ]);

  const lowStockProducts = products.filter(
    (product) =>
      product.currentStock <= product.minimumStock
  ).length;

  return res.status(200).json({
    success: true,

    summary: {
      totalCustomers,
      totalLeads,
      activeCustomers,
      inactiveCustomers,

      totalProducts,
      lowStockProducts,

      totalFollowUps,
      upcomingFollowUps,

      draftChallans,
      confirmedChallans,
      cancelledChallans,
    },
  });
};


// =====================================================
// GET DASHBOARD DETAILS
// GET /api/dashboard/details
// =====================================================

const getDashboardDetails = async (req, res) => {
  const now = new Date();

  const [
    upcomingFollowUps,
    products,
    recentChallans,
    recentStockMovements,
  ] = await Promise.all([
    // -------------------------------------------------
    // Upcoming follow-ups
    // -------------------------------------------------

    prisma.followUp.findMany({
      where: {
        followUpDate: {
          gte: now,
        },
      },
      include: {
        customer: {
          select: {
            id: true,
            customerName: true,
            mobile: true,
            businessName: true,
          },
        },
      },
      orderBy: {
        followUpDate: "asc",
      },
      take: 10,
    }),

    // -------------------------------------------------
    // Products
    // -------------------------------------------------

    prisma.product.findMany({
      orderBy: {
        currentStock: "asc",
      },
    }),

    // -------------------------------------------------
    // Recent challans
    // -------------------------------------------------

    prisma.challan.findMany({
      include: {
        customer: {
          select: {
            id: true,
            customerName: true,
            businessName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    }),

    // -------------------------------------------------
    // Recent stock movements
    // -------------------------------------------------

    prisma.stockMovement.findMany({
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
      take: 10,
    }),
  ]);

  const lowStockProducts = products
    .filter(
      (product) =>
        product.currentStock <= product.minimumStock
    )
    .slice(0, 10);

  return res.status(200).json({
    success: true,

    details: {
      upcomingFollowUps,
      lowStockProducts,
      recentChallans,
      recentStockMovements,
    },
  });
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  getDashboardSummary,
  getDashboardDetails,
};