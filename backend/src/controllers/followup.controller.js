const prisma = require("../lib/prisma");

// =====================================================
// CREATE FOLLOW-UP
// POST /api/followups
// =====================================================

const createFollowUp = async (req, res) => {
  const {
    customerId,
    followUpDate,
    notes,
  } = req.body;

  // -------------------------------------------------
  // Validate customer ID
  // -------------------------------------------------

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

  // -------------------------------------------------
  // Validate follow-up date
  // -------------------------------------------------

  if (!followUpDate) {
    return res.status(400).json({
      success: false,
      message: "followUpDate is required",
    });
  }

  const parsedFollowUpDate = new Date(followUpDate);

  if (
    Number.isNaN(parsedFollowUpDate.getTime())
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid followUpDate",
    });
  }

  // -------------------------------------------------
  // Validate notes
  // -------------------------------------------------

  if (!notes || notes.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Notes are required",
    });
  }

  // -------------------------------------------------
  // Find customer
  // -------------------------------------------------

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

  // -------------------------------------------------
  // Create follow-up
  // -------------------------------------------------

  const followUp = await prisma.followUp.create({
    data: {
      customerId: parsedCustomerId,
      followUpDate: parsedFollowUpDate,
      notes: notes.trim(),
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
    },
  });

  return res.status(201).json({
    success: true,
    message: "Follow-up created successfully",
    followUp,
  });
};


// =====================================================
// GET ALL FOLLOW-UPS
// GET /api/followups
// =====================================================

const getFollowUps = async (req, res) => {
  const followUps = await prisma.followUp.findMany({
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
    },
    orderBy: {
      followUpDate: "asc",
    },
  });

  return res.status(200).json({
    success: true,
    count: followUps.length,
    followUps,
  });
};


// =====================================================
// GET FOLLOW-UP BY ID
// GET /api/followups/:id
// =====================================================

const getFollowUpById = async (req, res) => {
  const followUpId = Number(req.params.id);

  // -------------------------------------------------
  // Validate follow-up ID
  // -------------------------------------------------

  if (
    !Number.isInteger(followUpId) ||
    followUpId <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid follow-up ID",
    });
  }

  // -------------------------------------------------
  // Find follow-up
  // -------------------------------------------------

  const followUp = await prisma.followUp.findUnique({
    where: {
      id: followUpId,
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
          status: true,
        },
      },
    },
  });

  if (!followUp) {
    return res.status(404).json({
      success: false,
      message: "Follow-up not found",
    });
  }

  return res.status(200).json({
    success: true,
    followUp,
  });
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createFollowUp,
  getFollowUps,
  getFollowUpById,
};