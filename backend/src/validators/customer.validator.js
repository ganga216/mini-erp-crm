const { z } = require("zod");

const customerSchema = z.object({
  customerName: z.string().min(2, "Customer name is required"),

  mobile: z.string().min(10, "Mobile number must be at least 10 characters"),

  email: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),

  businessName: z.string().optional(),

  gstNumber: z.string().optional(),

  customerType: z
    .enum(["RETAIL", "WHOLESALE", "DISTRIBUTOR"])
    .optional(),

  address: z.string().optional(),

  status: z
    .enum(["LEAD", "ACTIVE", "INACTIVE"])
    .optional(),

  followUpDate: z
    .string()
    .datetime()
    .optional()
    .or(z.literal("")),

  notes: z.string().optional(),
});

module.exports = {
  customerSchema,
};