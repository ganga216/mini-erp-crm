// =====================================================
// ROLE CONFIGURATION
// =====================================================

// Sidebar navigation items with role-based visibility
export const NAV_ITEMS = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: "📊",
    roles: ["ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"],
  },
  {
    label: "Customers",
    path: "/customers",
    icon: "👥",
    roles: ["ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"],
  },
  {
    label: "Follow-ups",
    path: "/follow-ups",
    icon: "📋",
    roles: ["ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"],
  },
  {
    label: "Products",
    path: "/products",
    icon: "📦",
    roles: ["ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"],
  },
  {
    label: "Inventory",
    path: "/inventory",
    icon: "🏭",
    roles: ["ADMIN", "WAREHOUSE", "ACCOUNTS"],
  },
  {
    label: "Challans",
    path: "/challans",
    icon: "📄",
    roles: ["ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"],
  },
];


// Role-based permission checks
export const PERMISSIONS = {
  customers: {
    create: ["ADMIN", "SALES"],
    edit:   ["ADMIN", "SALES"],
    read:   ["ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"],
  },

  followups: {
    create: ["ADMIN", "SALES"],
    read:   ["ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"],
  },

  products: {
    create: ["ADMIN", "WAREHOUSE"],
    read:   ["ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"],
  },

  stock: {
    create: ["ADMIN", "WAREHOUSE"],
    read:   ["ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"],
  },

  challans: {
    create:  ["ADMIN", "SALES", "WAREHOUSE"],
    confirm: ["ADMIN", "SALES", "WAREHOUSE"],
    cancel:  ["ADMIN", "SALES", "WAREHOUSE"],
    read:    ["ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"],
  },
};


// Helper: check if a role has permission
export const canAccess = (role, resource, action) => {
  const normalizedRole = String(role).trim().toUpperCase();
  const perms = PERMISSIONS[resource];

  if (!perms) return false;

  const allowed = perms[action];

  if (!allowed) return false;

  return allowed.includes(normalizedRole);
};


// Helper: get visible nav items for a role
export const getNavItemsForRole = (role) => {
  const normalizedRole = String(role).trim().toUpperCase();

  return NAV_ITEMS.filter((item) =>
    item.roles.includes(normalizedRole)
  );
};
