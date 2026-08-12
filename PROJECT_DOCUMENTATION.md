# Mini ERP + CRM Operations Portal

> **Full Stack Developer Case Study — Executive Summary & Technical Guide**

---

## 🌐 Quick Access & Live Links

- **Live Web Application:** [https://mini-erp-crm-phi.vercel.app](https://mini-erp-crm-phi.vercel.app)
- **GitHub Repository:** [https://github.com/ganga216/mini-erp-crm](https://github.com/ganga216/mini-erp-crm)
- **Live REST API (Render):** [https://mini-erp-crm-backend-rf4i.onrender.com](https://mini-erp-crm-backend-rf4i.onrender.com)
- **Developer:** Malla Gangadhar (`ganga216`)

---

## 1. What is this Project?

This project is an internal operations portal for wholesale and distribution companies. It streamlines:
1. **Customer CRM** — Managing accounts, contacts, and sales follow-ups.
2. **Product Catalog & Inventory** — Real-time stock levels, low-stock alerts, and movement logs.
3. **Sales Delivery Challans** — Creating dispatches, auto-deducting stock, and exporting invoices.
4. **Role-Based Access Control (RBAC)** — Restricting menu actions across 4 operational roles.

---

## 2. Demo Login Accounts

All test accounts use the password: **`password123`**

| Role | Email Address | Access Level & Purpose |
|------|---------------|------------------------|
| **👑 Admin** | `admin@erp.com` | Full access to all modules, creation, and configuration |
| **💼 Sales** | `sales@erp.com` | Customer CRM, follow-ups, and sales challan creation |
| **📦 Warehouse** | `warehouse@erp.com` | Product catalog, manual stock IN/OUT, challan confirmation |
| **📊 Accounts** | `accounts@erp.com` | Read-only access across all modules for auditing |

---

## 3. How the Core Business Flow Works

```
1. Draft Challan  ──►  2. Price Snapshot  ──►  3. Stock Check  ──►  4. Auto Deduct
Sales creates          System locks price     Verifies stock        Stock decremented
draft (CH-0001)        & SKU at creation      before delivery       upon confirmation
```

- **Safety Guarantee:** Stock cannot fall below zero. If stock is insufficient, the system blocks confirmation with a clear error message.
- **Cancellation Guarantee:** Cancelling a confirmed challan restores product stock automatically.

---

## 4. Role Permissions Matrix

| Module | Admin | Sales | Warehouse | Accounts |
|--------|-------|-------|-----------|----------|
| **Customers & Follow-ups** | ✅ Full Access | ✅ Create / Edit | 👁 Read Only | 👁 Read Only |
| **Products Catalog** | ✅ Full Access | 👁 Read Only | ✅ Create / Edit | 👁 Read Only |
| **Stock Movements (IN/OUT)** | ✅ Full Access | 👁 Read Only | ✅ Record Movements | 👁 Read Only |
| **Sales Challans** | ✅ Full Access | ✅ Create / Confirm | ✅ Create / Confirm | 👁 Read Only |

---

## 5. Technology Stack Summary

- **Frontend App:** React 19, Vite 8, React Router v7
- **Styling:** Custom Vanilla CSS3 (Responsive UI + Print Invoice Styles)
- **Backend API:** Node.js, Express.js (RESTful Routing)
- **Database & ORM:** PostgreSQL (Neon Serverless DB), Prisma ORM
- **Container & Hosting:** Docker Compose, Vercel (Frontend), Render (Backend)

---

## 6. Quick Setup & Local Running

Run the full stack with Docker in 1 command:

```bash
docker compose up --build
```

Or run standard Node commands:

```bash
# Backend setup
cd backend && npm install && node src/server.js

# Frontend setup
cd frontend && npm install && npm run dev
```

---

*A complete Postman collection is available in the root directory: `postman_collection.json`.*
