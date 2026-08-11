require("dotenv/config");

const {
  PrismaClient,
} = require("./generated/client");

const {
  PrismaPg,
} = require("@prisma/adapter-pg");

const bcrypt = require("bcrypt");


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
// SEED DATABASE
// =====================================================

async function main() {
  console.log("🌱 Starting database seed with sample data for all entities...");

  const passwordHash = await bcrypt.hash(
    "password123",
    10
  );

  // ---------------------------------------------------
  // 1. Users
  // ---------------------------------------------------

  const usersData = [
    { name: "Admin User", email: "admin@erp.com", role: "ADMIN" },
    { name: "Sales Executive", email: "sales@erp.com", role: "SALES" },
    { name: "Warehouse Manager", email: "warehouse@erp.com", role: "WAREHOUSE" },
    { name: "Accounts Manager", email: "accounts@erp.com", role: "ACCOUNTS" },
  ];

  for (const u of usersData) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, passwordHash },
      create: { name: u.name, email: u.email, role: u.role, passwordHash },
    });
  }
  console.log("✅ Users seeded (4 roles)");

  // ---------------------------------------------------
  // 2. Customers
  // ---------------------------------------------------

  const customersData = [
    {
      customerName: "Rajesh Kumar",
      mobile: "+91 9876543210",
      email: "rajesh@apextech.com",
      businessName: "Apex Industrial Solutions",
      gstNumber: "27AAACA12341Z1",
      customerType: "WHOLESALE",
      address: "Plot 42, MIDC Industrial Area, Pune, Maharashtra",
      status: "ACTIVE",
      followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      notes: "Interested in bulk order for quarterly machinery spares.",
    },
    {
      customerName: "Anita Sharma",
      mobile: "+91 9812345678",
      email: "anita@titaninfra.in",
      businessName: "Titan Infrastructure Ltd",
      gstNumber: "07AABCT9876F2Z5",
      customerType: "DISTRIBUTOR",
      address: "Suite 302, Cyber Tower, Sector 62, Gurgaon, Haryana",
      status: "ACTIVE",
      followUpDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      notes: "Requires updated price catalog for Q4 projects.",
    },
    {
      customerName: "Vikram Patel",
      mobile: "+91 9723456789",
      email: "vikram@pateltraders.com",
      businessName: "Patel Electricals & Hardware",
      gstNumber: "24AABCP4567H1Z8",
      customerType: "RETAIL",
      address: "12 Station Road, Anand, Gujarat",
      status: "LEAD",
      followUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
      notes: "Initial inquiry regarding copper wiring rolls and valves.",
    },
    {
      customerName: "Siddharth Mehta",
      mobile: "+91 9934567890",
      email: "siddharth@zenithbuilders.org",
      businessName: "Zenith Construction Group",
      gstNumber: "29AABCZ3210K1Z3",
      customerType: "WHOLESALE",
      address: "88 MG Road, Indiranagar, Bengaluru, Karnataka",
      status: "ACTIVE",
      followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      notes: "Follow up regarding payment for Challan CH-0002.",
    },
    {
      customerName: "Priya Nair",
      mobile: "+91 9645678901",
      email: "priya@nairlogistics.com",
      businessName: "Nair Global Freight Solutions",
      gstNumber: "32AABCN6543M1Z9",
      customerType: "DISTRIBUTOR",
      address: "Harbor View Complex, Willingdon Island, Kochi, Kerala",
      status: "INACTIVE",
      followUpDate: null,
      notes: "Dormant account since last quarter dispatches.",
    },
  ];

  // Clear existing data cleanly if needed or upsert
  const seededCustomers = [];
  for (const c of customersData) {
    const existing = await prisma.customer.findFirst({
      where: { mobile: c.mobile },
    });
    if (existing) {
      const updated = await prisma.customer.update({
        where: { id: existing.id },
        data: c,
      });
      seededCustomers.push(updated);
    } else {
      const created = await prisma.customer.create({ data: c });
      seededCustomers.push(created);
    }
  }
  console.log(`✅ Customers seeded (${seededCustomers.length} records)`);

  // ---------------------------------------------------
  // 3. Products (including low-stock examples)
  // ---------------------------------------------------

  const productsData = [
    {
      name: "Industrial Steel Plates (10mm)",
      sku: "PRD-STL-001",
      category: "Raw Materials",
      unitPrice: 4500.0,
      currentStock: 4, // LOW STOCK (minimum is 10)
      minimumStock: 10,
      warehouseLocation: "Bay A, Rack 01",
    },
    {
      name: "Copper Wiring Roll (100m)",
      sku: "PRD-COP-002",
      category: "Electrical",
      unitPrice: 2800.0,
      currentStock: 35,
      minimumStock: 15,
      warehouseLocation: "Bay B, Shelf 04",
    },
    {
      name: "Hydraulic Pump Assembly 5HP",
      sku: "PRD-HYD-003",
      category: "Machinery",
      unitPrice: 18500.0,
      currentStock: 2, // LOW STOCK (minimum is 5)
      minimumStock: 5,
      warehouseLocation: "Bay C, Rack 02",
    },
    {
      name: "Pneumatic Control Valve Kit",
      sku: "PRD-PNU-004",
      category: "Pneumatics",
      unitPrice: 1250.0,
      currentStock: 60,
      minimumStock: 20,
      warehouseLocation: "Bay B, Shelf 02",
    },
    {
      name: "Heavy Duty Roller Bearing 6205",
      sku: "PRD-BRG-005",
      category: "Hardware",
      unitPrice: 350.0,
      currentStock: 3, // LOW STOCK (minimum is 25)
      minimumStock: 25,
      warehouseLocation: "Bay A, Bin 12",
    },
    {
      name: "Industrial Safety Helmet (Yellow)",
      sku: "PRD-SAF-006",
      category: "Safety Gear",
      unitPrice: 420.0,
      currentStock: 120,
      minimumStock: 30,
      warehouseLocation: "Bay D, Rack 05",
    },
  ];

  const seededProducts = [];
  for (const p of productsData) {
    const existing = await prisma.product.findUnique({
      where: { sku: p.sku },
    });
    if (existing) {
      const updated = await prisma.product.update({
        where: { id: existing.id },
        data: p,
      });
      seededProducts.push(updated);
    } else {
      const created = await prisma.product.create({ data: p });
      seededProducts.push(created);
    }
  }
  console.log(`✅ Products seeded (${seededProducts.length} records, 3 low-stock items)`);

  // ---------------------------------------------------
  // 4. Follow-ups
  // ---------------------------------------------------

  const followUpsData = [
    {
      customerId: seededCustomers[0].id,
      followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      notes: "Send quotation for 20 units of Hydraulic Pumps and confirm dispatch timeline.",
      createdBy: "sales@erp.com",
    },
    {
      customerId: seededCustomers[1].id,
      followUpDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      notes: "Schedule technical demo meeting with engineering team.",
      createdBy: "sales@erp.com",
    },
    {
      customerId: seededCustomers[2].id,
      followUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      notes: "Call Mr. Patel to confirm delivery address for initial sample order.",
      createdBy: "admin@erp.com",
    },
    {
      customerId: seededCustomers[3].id,
      followUpDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // past follow-up
      notes: "Reviewed contract terms with Accounts manager.",
      createdBy: "sales@erp.com",
    },
  ];

  for (const f of followUpsData) {
    await prisma.followUp.create({ data: f });
  }
  console.log("✅ Follow-ups seeded");

  // ---------------------------------------------------
  // 5. Stock Movements
  // ---------------------------------------------------

  const stockMovementsData = [
    {
      productId: seededProducts[0].id,
      quantity: 50,
      movementType: "IN",
      reason: "Initial Vendor Shipment PO-2026-001",
      createdBy: "warehouse@erp.com",
    },
    {
      productId: seededProducts[1].id,
      quantity: 50,
      movementType: "IN",
      reason: "Restock from Central Warehouse",
      createdBy: "warehouse@erp.com",
    },
    {
      productId: seededProducts[2].id,
      quantity: 10,
      movementType: "IN",
      reason: "Factory Direct Delivery",
      createdBy: "warehouse@erp.com",
    },
    {
      productId: seededProducts[0].id,
      quantity: 46,
      movementType: "OUT",
      reason: "Dispatch for Challan CH-0001",
      createdBy: "warehouse@erp.com",
    },
    {
      productId: seededProducts[2].id,
      quantity: 8,
      movementType: "OUT",
      reason: "Dispatch for Challan CH-0001",
      createdBy: "warehouse@erp.com",
    },
  ];

  for (const sm of stockMovementsData) {
    await prisma.stockMovement.create({ data: sm });
  }
  console.log("✅ Stock movements seeded");

  // ---------------------------------------------------
  // 6. Challans & Items
  // ---------------------------------------------------

  // Challan 1: CONFIRMED
  const existingChallan1 = await prisma.challan.findUnique({
    where: { challanNumber: "CH-0001" },
  });

  if (!existingChallan1) {
    const challan1 = await prisma.challan.create({
      data: {
        challanNumber: "CH-0001",
        customerId: seededCustomers[0].id,
        totalQuantity: 54,
        status: "CONFIRMED",
        createdBy: "sales@erp.com",
        items: {
          create: [
            {
              productId: seededProducts[0].id,
              productNameSnapshot: seededProducts[0].name,
              skuSnapshot: seededProducts[0].sku,
              unitPriceSnapshot: seededProducts[0].unitPrice,
              quantity: 46,
              totalPrice: 46 * seededProducts[0].unitPrice,
            },
            {
              productId: seededProducts[2].id,
              productNameSnapshot: seededProducts[2].name,
              skuSnapshot: seededProducts[2].sku,
              unitPriceSnapshot: seededProducts[2].unitPrice,
              quantity: 8,
              totalPrice: 8 * seededProducts[2].unitPrice,
            },
          ],
        },
      },
    });
    console.log(`✅ Challan CH-0001 (CONFIRMED) seeded with ${challan1.totalQuantity} items`);
  }

  // Challan 2: DRAFT
  const existingChallan2 = await prisma.challan.findUnique({
    where: { challanNumber: "CH-0002" },
  });

  if (!existingChallan2) {
    const challan2 = await prisma.challan.create({
      data: {
        challanNumber: "CH-0002",
        customerId: seededCustomers[1].id,
        totalQuantity: 15,
        status: "DRAFT",
        createdBy: "sales@erp.com",
        items: {
          create: [
            {
              productId: seededProducts[1].id,
              productNameSnapshot: seededProducts[1].name,
              skuSnapshot: seededProducts[1].sku,
              unitPriceSnapshot: seededProducts[1].unitPrice,
              quantity: 10,
              totalPrice: 10 * seededProducts[1].unitPrice,
            },
            {
              productId: seededProducts[3].id,
              productNameSnapshot: seededProducts[3].name,
              skuSnapshot: seededProducts[3].sku,
              unitPriceSnapshot: seededProducts[3].unitPrice,
              quantity: 5,
              totalPrice: 5 * seededProducts[3].unitPrice,
            },
          ],
        },
      },
    });
    console.log(`✅ Challan CH-0002 (DRAFT) seeded with ${challan2.totalQuantity} items`);
  }

  // Challan 3: CANCELLED
  const existingChallan3 = await prisma.challan.findUnique({
    where: { challanNumber: "CH-0003" },
  });

  if (!existingChallan3) {
    const challan3 = await prisma.challan.create({
      data: {
        challanNumber: "CH-0003",
        customerId: seededCustomers[3].id,
        totalQuantity: 20,
        status: "CANCELLED",
        createdBy: "admin@erp.com",
        items: {
          create: [
            {
              productId: seededProducts[5].id,
              productNameSnapshot: seededProducts[5].name,
              skuSnapshot: seededProducts[5].sku,
              unitPriceSnapshot: seededProducts[5].unitPrice,
              quantity: 20,
              totalPrice: 20 * seededProducts[5].unitPrice,
            },
          ],
        },
      },
    });
    console.log(`✅ Challan CH-0003 (CANCELLED) seeded with ${challan3.totalQuantity} items`);
  }

  console.log("");
  console.log("========================================");
  console.log("✅ All entities seeded successfully!");
  console.log("========================================");
}


// =====================================================
// RUN
// =====================================================

main()
  .catch((error) => {
    console.error("❌ Seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });