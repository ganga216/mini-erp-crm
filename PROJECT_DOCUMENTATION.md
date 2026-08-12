# Mini ERP + CRM Operations Portal — System Documentation

## Project Details
- **Project:** Wholesale & Distribution Mini ERP/CRM Operations Portal
- **Developer:** Malla Gangadhar (`ganga216`)
- **Live Frontend:** [https://mini-erp-crm-phi.vercel.app](https://mini-erp-crm-phi.vercel.app)
- **Live Backend API:** [https://mini-erp-crm-backend-rf4i.onrender.com](https://mini-erp-crm-backend-rf4i.onrender.com)
- **GitHub Repository:** [https://github.com/ganga216/mini-erp-crm](https://github.com/ganga216/mini-erp-crm)
- **Database:** PostgreSQL (Neon Cloud)

---

## 1. Project Overview

This application is a full-stack internal management portal built for wholesale and distribution companies. It enables internal teams (Sales, Warehouse, Accounts, Admin) to handle customer CRM records, product catalogs, inventory stock movements, and sales delivery challans in real-time.

### Key Capabilities:
- Customer CRM management with search, filters (Lead/Active/Inactive, Retail/Wholesale/Distributor), and follow-up notes.
- Product catalog tracking with minimum stock alerts and manual Stock IN/OUT adjustment logging.
- Sales delivery challan lifecycle (Draft -> Add Items with Price Snapshots -> Confirm & Auto-Deduct Stock -> Cancel & Restore Stock).
- Role-based access control protecting routes and action buttons per user role.
- Printable delivery challan invoices via browser print (`Ctrl + P`).

---

## 2. Tech Stack

- **Frontend:** React 19, Vite 8, React Router v7
- **Styling:** Vanilla CSS3 (Custom Responsive System + Print Invoice Styles)
- **Backend API:** Node.js, Express.js
- **Database & ORM:** PostgreSQL (Neon Cloud), Prisma ORM
- **Deployment:** Vercel (Frontend), Render (Backend)

---

## 3. Database Schema

The database relies on PostgreSQL managed via Prisma ORM:

```
User (id, name, email, passwordHash, role [ADMIN | SALES | WAREHOUSE | ACCOUNTS])

Customer (id, customerName, mobile, email, businessName, gstNumber, customerType, address, status, followUpDate, notes)

FollowUp (id, customerId, followUpDate, notes, createdBy, createdAt)

Product (id, name, sku, category, unitPrice, currentStock, minimumStock, warehouseLocation)

StockMovement (id, productId, quantity, movementType [IN | OUT], reason, createdBy, createdAt)

Challan (id, challanNumber, customerId, totalQuantity, status [DRAFT | CONFIRMED | CANCELLED], createdBy, createdAt)

ChallanItem (id, challanId, productId, productNameSnapshot, skuSnapshot, unitPriceSnapshot, quantity, totalPrice)
```

---

## 4. Business Logic & Workflows

### Sales Challan Workflow:
1. **Draft Creation:** Sales or Admin creates a draft challan for a customer. A sequential number (`CH-0001`, `CH-0002`) is assigned automatically.
2. **Item Addition & Price Snapshots:** Product rows are attached. Product name, SKU, and unit price are saved as snapshots so future price updates do not change historical challans.
3. **Confirmation & Stock Deduction:** Upon confirmation, a database transaction checks current stock. If stock is available, stock is decremented and a Stock OUT entry is logged. If stock is insufficient, an error is returned.
4. **Cancellation & Stock Restoration:** Cancelling a confirmed challan restores product stock and logs a Stock IN entry.

---

## 5. Role Permissions Matrix

| Module | Admin | Sales | Warehouse | Accounts |
|--------|-------|-------|-----------|----------|
| Customers & Follow-ups | Full Access | Create / Edit | Read Only | Read Only |
| Products Catalog | Full Access | Read Only | Create / Edit | Read Only |
| Stock Movements | Full Access | Read Only | Create (IN/OUT) | Read Only |
| Challans | Full Access | Create / Confirm | Create / Confirm | Read Only |

---

## 6. API Endpoints

A Postman collection is included in the project root: `postman_collection.json`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get logged-in user |
| GET | `/api/dashboard/summary` | Dashboard KPI metrics |
| GET | `/api/dashboard/details` | Dashboard tables |
| GET | `/api/customers` | List/search customers |
| POST | `/api/customers` | Create customer |
| PUT | `/api/customers/:id` | Update customer |
| GET | `/api/followups` | List follow-ups |
| POST | `/api/followups` | Create follow-up |
| GET | `/api/products` | List products |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product |
| GET | `/api/products/low-stock` | Get low-stock products |
| POST | `/api/products/:id/stock` | Create stock movement |
| GET | `/api/challans` | List challans |
| POST | `/api/challans` | Create draft challan |
| POST | `/api/challans/:id/items` | Add item to challan |
| POST | `/api/challans/:id/confirm` | Confirm challan & deduct stock |
| POST | `/api/challans/:id/cancel` | Cancel challan & restore stock |

---

## 7. Deployment & Environment Variables

### Render Backend Environment Variables:
```env
DATABASE_URL="postgresql://neondb_owner:npg_VoNi4TCm8XYt@ep-cold-leaf-aytf7o1y.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="mini-erp-secret-key-2026-production"
PORT=5000
FRONTEND_URL="https://mini-erp-crm-phi.vercel.app"
```

### Vercel Frontend Environment Variables:
```env
VITE_API_URL="https://mini-erp-crm-backend-rf4i.onrender.com/api"
```

---

## 8. Test Accounts

Password for all accounts: `password123`

| Role | Email |
|------|-------|
| Admin | `admin@erp.com` |
| Sales | `sales@erp.com` |
| Warehouse | `warehouse@erp.com` |
| Accounts | `accounts@erp.com` |
