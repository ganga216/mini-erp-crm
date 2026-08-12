# Mini ERP + CRM Operations Portal

A full-stack internal management portal for wholesale and distribution businesses to manage customers, products, inventory, and sales delivery challans.

---

## Live Links

- **Live Application:** [https://mini-erp-crm-phi.vercel.app](https://mini-erp-crm-phi.vercel.app)
- **Live API:** [https://mini-erp-crm-backend-rf4i.onrender.com](https://mini-erp-crm-backend-rf4i.onrender.com)
- **GitHub Repository:** [https://github.com/ganga216/mini-erp-crm](https://github.com/ganga216/mini-erp-crm)
- **Developer:** Malla Gangadhar (`ganga216`)

---

## Features

- **Authentication:** JWT login with 4 roles (Admin, Sales, Warehouse, Accounts).
- **Customer CRM:** Full CRUD, search/filter, follow-up logs, and customer details view.
- **Product Catalog:** Product list, low-stock threshold alerts, and manual Stock IN/OUT tracking.
- **Sales Challans:** Multi-step draft creation, item price snapshots, automatic stock deduction on confirmation, and stock restoration on cancellation.
- **Invoice Export:** Printable delivery notes and invoices via browser print (`Ctrl + P`).
- **Role-Based Access Control:** Frontend UI filtering and backend API authorization per user role.

---

## Demo Test Credentials

Password for all test accounts: **`password123`**

| Role | Email | Scope |
|------|-------|-------|
| Admin | `admin@erp.com` | Full system access |
| Sales | `sales@erp.com` | Customers, follow-ups, draft/confirm challans |
| Warehouse | `warehouse@erp.com` | Products, stock movements, confirm challans |
| Accounts | `accounts@erp.com` | Read-only access across all pages |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite 8, React Router v7 |
| Styling | Vanilla CSS3 (Custom Responsive System + Print Invoice Styles) |
| Backend | Node.js, Express.js |
| Database | PostgreSQL (Neon Cloud), Prisma ORM |
| Deployment | Vercel (Frontend), Render (Backend) |

---

## Role Permissions Matrix

| Module | Admin | Sales | Warehouse | Accounts |
|--------|-------|-------|-----------|----------|
| Customers & Follow-ups | Full Access | Create / Edit | Read Only | Read Only |
| Products Catalog | Full Access | Read Only | Create / Edit | Read Only |
| Stock Movements | Full Access | Read Only | Create (IN/OUT) | Read Only |
| Challans | Full Access | Create / Confirm | Create / Confirm | Read Only |

---

## Local Setup

```bash
# 1. Backend setup
cd backend
npm install
node prisma/seed.js
node src/server.js

# 2. Frontend setup (in another terminal)
cd frontend
npm install
npm run dev
```

---

## Docker Setup

```bash
docker compose up --build
```

*Postman API collection is included in `postman_collection.json`.*
