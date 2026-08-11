const prisma = require("../lib/prisma");

// =====================================================
// CREATE CUSTOMER
// POST /api/customers
// =====================================================

const createCustomer = async (req, res) => {
  const {
    customerName,
    mobile,
    email,
    businessName,
    gstNumber,
    customerType,
    address,
    status,
    followUpDate,
    notes,
  } = req.body;

  // -------------------------------------------------
  // Validate customer name
  // -------------------------------------------------

  if (
    !customerName ||
    customerName.trim().length === 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Customer name is required",
    });
  }

  // -------------------------------------------------
  // Validate mobile
  // -------------------------------------------------

  if (!mobile || mobile.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Mobile number is required",
    });
  }

  // -------------------------------------------------
  // Validate customer type
  // -------------------------------------------------

  const allowedCustomerTypes = [
    "RETAIL",
    "WHOLESALE",
    "DISTRIBUTOR",
  ];

  const finalCustomerType =
    customerType || "RETAIL";

  if (!allowedCustomerTypes.includes(finalCustomerType)) {
    return res.status(400).json({
      success: false,
      message:
        "customerType must be RETAIL, WHOLESALE or DISTRIBUTOR",
    });
  }

  // -------------------------------------------------
  // Validate status
  // -------------------------------------------------

  const allowedStatuses = [
    "LEAD",
    "ACTIVE",
    "INACTIVE",
  ];

  const finalStatus = status || "LEAD";

  if (!allowedStatuses.includes(finalStatus)) {
    return res.status(400).json({
      success: false,
      message:
        "status must be LEAD, ACTIVE or INACTIVE",
    });
  }

  // -------------------------------------------------
  // Validate follow-up date
  // -------------------------------------------------

  let parsedFollowUpDate = null;

  if (followUpDate) {
    parsedFollowUpDate = new Date(followUpDate);

    if (Number.isNaN(parsedFollowUpDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid followUpDate",
      });
    }
  }

  // -------------------------------------------------
  // Create customer
  // -------------------------------------------------

  const customer = await prisma.customer.create({
    data: {
      customerName: customerName.trim(),
      mobile: mobile.trim(),
      email: email?.trim() || null,
      businessName: businessName?.trim() || null,
      gstNumber: gstNumber?.trim() || null,

      customerType: finalCustomerType,

      address: address?.trim() || null,

      status: finalStatus,

      followUpDate: parsedFollowUpDate,

      notes: notes?.trim() || null,
    },
  });

  return res.status(201).json({
    success: true,
    message: "Customer created successfully",
    customer,
  });
};


// =====================================================
// GET ALL CUSTOMERS
// GET /api/customers
// =====================================================

const getCustomers = async (req, res) => {
  const customers = await prisma.customer.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return res.status(200).json({
    success: true,
    count: customers.length,
    customers,
  });
};


// =====================================================
// GET CUSTOMER BY ID
// GET /api/customers/:id
// =====================================================

const getCustomerById = async (req, res) => {
  const customerId = Number(req.params.id);

  // -------------------------------------------------
  // Validate customer ID
  // -------------------------------------------------

  if (
    !Number.isInteger(customerId) ||
    customerId <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid customer ID",
    });
  }

  // -------------------------------------------------
  // Find customer
  // -------------------------------------------------

  const customer = await prisma.customer.findUnique({
    where: {
      id: customerId,
    },
    include: {
      followUps: {
        orderBy: {
          followUpDate: "asc",
        },
      },
      challans: {
        select: {
          id: true,
          challanNumber: true,
          totalQuantity: true,
          status: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!customer) {
    return res.status(404).json({
      success: false,
      message: "Customer not found",
    });
  }

  return res.status(200).json({
    success: true,
    customer,
  });
};


// =====================================================
// UPDATE CUSTOMER
// PUT /api/customers/:id
// =====================================================

const updateCustomer = async (req, res) => {
  const customerId = Number(req.params.id);

  // -------------------------------------------------
  // Validate customer ID
  // -------------------------------------------------

  if (
    !Number.isInteger(customerId) ||
    customerId <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid customer ID",
    });
  }

  // -------------------------------------------------
  // Check customer exists
  // -------------------------------------------------

  const existingCustomer =
    await prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    });

  if (!existingCustomer) {
    return res.status(404).json({
      success: false,
      message: "Customer not found",
    });
  }

  const {
    customerName,
    mobile,
    email,
    businessName,
    gstNumber,
    customerType,
    address,
    status,
    followUpDate,
    notes,
  } = req.body;

  // -------------------------------------------------
  // Validate customer name
  // -------------------------------------------------

  if (
    customerName !== undefined &&
    (!customerName ||
      customerName.trim().length === 0)
  ) {
    return res.status(400).json({
      success: false,
      message: "Customer name cannot be empty",
    });
  }

  // -------------------------------------------------
  // Validate mobile
  // -------------------------------------------------

  if (
    mobile !== undefined &&
    (!mobile || mobile.trim().length === 0)
  ) {
    return res.status(400).json({
      success: false,
      message: "Mobile number cannot be empty",
    });
  }

  // -------------------------------------------------
  // Validate customer type
  // -------------------------------------------------

  const allowedCustomerTypes = [
    "RETAIL",
    "WHOLESALE",
    "DISTRIBUTOR",
  ];

  if (
    customerType !== undefined &&
    !allowedCustomerTypes.includes(customerType)
  ) {
    return res.status(400).json({
      success: false,
      message:
        "customerType must be RETAIL, WHOLESALE or DISTRIBUTOR",
    });
  }

  // -------------------------------------------------
  // Validate status
  // -------------------------------------------------

  const allowedStatuses = [
    "LEAD",
    "ACTIVE",
    "INACTIVE",
  ];

  if (
    status !== undefined &&
    !allowedStatuses.includes(status)
  ) {
    return res.status(400).json({
      success: false,
      message:
        "status must be LEAD, ACTIVE or INACTIVE",
    });
  }

  // -------------------------------------------------
  // Validate follow-up date
  // -------------------------------------------------

  let parsedFollowUpDate;

  if (followUpDate !== undefined) {
    if (followUpDate === null || followUpDate === "") {
      parsedFollowUpDate = null;
    } else {
      parsedFollowUpDate = new Date(followUpDate);

      if (
        Number.isNaN(
          parsedFollowUpDate.getTime()
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid followUpDate",
        });
      }
    }
  }

  // -------------------------------------------------
  // Build update data
  // -------------------------------------------------

  const updateData = {};

  if (customerName !== undefined) {
    updateData.customerName =
      customerName.trim();
  }

  if (mobile !== undefined) {
    updateData.mobile = mobile.trim();
  }

  if (email !== undefined) {
    updateData.email =
      email?.trim() || null;
  }

  if (businessName !== undefined) {
    updateData.businessName =
      businessName?.trim() || null;
  }

  if (gstNumber !== undefined) {
    updateData.gstNumber =
      gstNumber?.trim() || null;
  }

  if (customerType !== undefined) {
    updateData.customerType =
      customerType;
  }

  if (address !== undefined) {
    updateData.address =
      address?.trim() || null;
  }

  if (status !== undefined) {
    updateData.status = status;
  }

  if (followUpDate !== undefined) {
    updateData.followUpDate =
      parsedFollowUpDate;
  }

  if (notes !== undefined) {
    updateData.notes =
      notes?.trim() || null;
  }

  // -------------------------------------------------
  // Update customer
  // -------------------------------------------------

  const customer = await prisma.customer.update({
    where: {
      id: customerId,
    },
    data: updateData,
  });

  return res.status(200).json({
    success: true,
    message: "Customer updated successfully",
    customer,
  });
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
};