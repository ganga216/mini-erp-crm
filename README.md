# Mini ERP + CRM Operations Portal

> **Full Stack Developer Case Study — Wholesale & Distribution Management System**

---

## 🌐 Live Application & Links

- 🚀 **Live Web Application:** [https://mini-erp-crm-phi.vercel.app](https://mini-erp-crm-phi.vercel.app)
- ⚡ **Live REST API (Render):** [https://mini-erp-crm-backend-rf4i.onrender.com](https://mini-erp-crm-backend-rf4i.onrender.com)
- 💻 **GitHub Repository:** [https://github.com/ganga216/mini-erp-crm](https://github.com/ganga216/mini-erp-crm)
- 👤 **Developer:** Malla Gangadhar (`ganga216`)

---

## 1. What is this Project?

This project is an internal management portal built for wholesale and distribution operations. It coordinates:
- 👥 **Customer CRM:** Managing accounts, contact details, lead status, and scheduling follow-ups.
- 📦 **Product Catalog & Inventory:** Tracking real-time stock levels, low-stock alerts (⚠), and audit logs.
- 📄 **Sales Delivery Challans:** Creating dispatches, locking price snapshots, auto-deducting inventory on confirmation, and restoring stock on cancellation.
- 🖨 **PDF Invoice Export:** Printable delivery notes and invoices via browser print (`Ctrl + P`).
- 🛡 **Role-Based Access Control (RBAC):** Tailored UI controls across 4 distinct operational roles.

---

## 2. 🔑 Demo Login Credentials

All test accounts share the universal password: **`password123`**

| Role | Email Address | Access Level & Scope |
|------|---------------|----------------------|
| **👑 Admin** | `admin@erp.com` | Full system access across all modules |
| **💼 Sales** | `sales@erp.com` | Customer CRM, follow-ups, and sales challan creation |
| **📦 Warehouse** | `warehouse@erp.com` | Product catalog, manual stock IN/OUT, challan confirmation |
| **📊 Accounts** | `accounts@erp.com` | Read-only access across all modules for auditing |

---

## 3. 🔄 Core Business & Delivery Flow

```
1. Draft Challan  ──►  2. Price Snapshot  ──►  3. Stock Check  ──►  4. Auto Deduct
Sales creates          System locks price     Verifies stock        Stock decremented
draft (CH-0001)        & SKU at creation      before delivery       upon confirmation
```

- **Stock Safety:** Stock cannot fall below zero. Insufficient stock blocks confirmation with an error message.
- **Cancellation Restores Stock:** Cancelling a confirmed delivery automatically returns items back to inventory.

---

## 4. 📊 Role Permissions Matrix

| Operational Module | Admin | Sales | Warehouse | Accounts |
|--------------------|-------|-------|-----------|----------|
| **Customers & Follow-ups** | ✅ Full Access | ✅ Create / Edit | 👁 Read Only | 👁 Read Only |
| **Products Catalog** | ✅ Full Access | 👁 Read Only | ✅ Create / Edit | 👁 Read Only |
| **Stock Movements (IN/OUT)** | ✅ Full Access | 👁 Read Only | ✅ Record Movements | 👁 Read Only |
| **Sales Challans** | ✅ Full Access | ✅ Create / Confirm | ✅ Create / Confirm | 👁 Read Only |

---

## 5. 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend App** | React 19, Vite 8, React Router v7 | Fast SPA UI & client-side routing |
| **Styling** | Vanilla CSS3 (Custom Tokens) | Responsive design & `@media print` invoice styling |
| **Backend API** | Node.js, Express.js | REST APIs, JWT authentication, RBAC middleware |
| **Database & ORM** | PostgreSQL (Neon DB), Prisma ORM | Relational schema, transactions & type-safe queries |
| **Containers & Deploy** | Docker Compose, Vercel, Render | Containerization & free cloud hosting |

---

## 6. 🚀 Quick Setup Guide

### Option A: 1-Command Docker Setup (Recommended)
```bash
docker compose up --build
```

### Option B: Standard Local Setup
```bash
# 1. Backend setup
cd backend
npm install
node prisma/seed.js
node src/server.js

# 2. Frontend setup (in a new terminal)
cd frontend
npm install
npm run dev
```

---

*A complete Postman API collection is included in the project root: `postman_collection.json`.*  
*Full printable HTML documentation is available in `DOCUMENTATION.html`.*
