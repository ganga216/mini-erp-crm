# Mini ERP + CRM Operations Portal
## Complete System Architecture, Process & Production Specification

**Project Title:** Wholesale & Distribution Mini ERP + CRM  
**Developer:** Malla Gangadhar (`ganga216`)  
**Live Frontend:** [https://mini-erp-crm-phi.vercel.app](https://mini-erp-crm-phi.vercel.app)  
**Live Backend API:** [https://mini-erp-crm-backend-rf4i.onrender.com](https://mini-erp-crm-backend-rf4i.onrender.com)  
**GitHub Repository:** [https://github.com/ganga216/mini-erp-crm](https://github.com/ganga216/mini-erp-crm)  
**Database:** PostgreSQL (Neon Cloud Serverless Cluster)  

---

## 📑 Table of Contents (Index)

1. [Business Context & System Overview](#1-business-context--system-overview)
2. [System Architecture & Technology Stack](#2-system-architecture--technology-stack)
3. [Database Schema & Data Models](#3-database-schema--data-models)
4. [Business Processes & Operational Workflows](#4-business-processes--operational-workflows)
5. [Role-Based Access Control (RBAC) Matrix](#5-role-based-access-control-rbac-matrix)
6. [Complete REST API Specifications](#6-complete-rest-api-specifications)
7. [Production Deployment & Infrastructure](#7-production-deployment--infrastructure)
8. [Demo Test Credentials](#8-demo-test-credentials)
9. [System Assumptions & Technical Limitations](#9-system-assumptions--technical-limitations)

---

## 1. Business Context & System Overview

The **Mini ERP + CRM Operations Portal** is a centralized business management platform tailored for wholesale distributors and manufacturing suppliers. It unifies operations across sales, warehouse inventory, and accounts into a single real-time workflow.

### Core Business Value Delivered:

- **Automated Inventory Integrity:** Sales dispatches automatically update inventory levels with zero manual calculation errors.
- **Financial Audit Trail:** Delivery challans capture exact product prices at creation time, preserving historical record accuracy even if product catalog prices change later.
- **Proactive Low-Stock Management:** Automated minimum stock threshold tracking flags items requiring immediate reordering.
- **Multidisciplinary Security:** Strict role-based permissions safeguard sensitive business operations (e.g. preventing sales staff from altering inventory stock counts directly).

---

## 2. System Architecture & Technology Stack

The system follows a modern decoupled Client-Server architecture with a REST API backend and a single-page Application (SPA) frontend.

```
+-------------------------------------------------------------------------+
|                            CLIENT LAYER                                 |
|  React 19 SPA (Vercel CDN) ---> Axios Interceptors ---> Bearer JWT Auth |
+------------------------------------+------------------------------------+
                                     | HTTPS / REST APIs
+------------------------------------v------------------------------------+
|                            SERVER LAYER                                 |
|  Node.js / Express API (Render) ---> CORS & Security Middleware         |
|                                 ---> Role Authorization Middleware      |
|                                 ---> Prisma ORM Data Access Layer       |
+------------------------------------+------------------------------------+
                                     | Encrypted Database Connection
+------------------------------------v------------------------------------+
|                           DATABASE LAYER                                |
|             PostgreSQL 15 Serverless Database (Neon Cloud)               |
+-------------------------------------------------------------------------+
```

### Technology Stack Specifications:

| Layer | Technology Selected | Description & Key Libraries |
|-------|---------------------|-----------------------------|
| **Frontend** | React 19, Vite 8, React Router v7 | Single Page Application architecture with client-side state routing and responsive component layouts. |
| **Styling** | Vanilla CSS3 System | Custom CSS variables design system with zero external UI framework overhead + `@media print` rules for PDF invoices. |
| **Backend API** | Node.js, Express.js | REST API web server with asynchronous error handling wrappers and bcrypt password hashing. |
| **Database & ORM** | PostgreSQL, Prisma ORM | Relational data layer utilizing Prisma client with `@prisma/adapter-pg` driver for Neon serverless postgres. |
| **Hosting Platform** | Vercel (Frontend), Render (Backend) | Fully automated deployment pipeline with zero-downtime builds and automatic SSL certificate generation. |

---

## 3. Database Schema & Data Models

The database relational model is built using Prisma ORM with strict constraint enforcement and indexing.

```
User (id, name, email, passwordHash, role, createdAt, updatedAt)
  └─ role Enum: [ADMIN, SALES, WAREHOUSE, ACCOUNTS]

Customer (id, customerName, mobile, email, businessName, gstNumber, customerType, address, status, followUpDate, notes, createdAt)
  ├─ customerType Enum: [RETAIL, WHOLESALE, DISTRIBUTOR]
  ├─ status Enum: [LEAD, ACTIVE, INACTIVE]
  ├─ Has Many: FollowUp[]
  └─ Has Many: Challan[]

Product (id, name, sku, category, unitPrice, currentStock, minimumStock, warehouseLocation, createdAt)
  ├─ Has Many: StockMovement[]
  └─ Has Many: ChallanItem[]

StockMovement (id, productId, quantity, movementType, reason, createdBy, createdAt)
  ├─ movementType Enum: [IN, OUT]
  └─ Belongs To: Product

Challan (id, challanNumber, customerId, totalQuantity, status, createdBy, createdAt)
  ├─ status Enum: [DRAFT, CONFIRMED, CANCELLED]
  ├─ Belongs To: Customer
  └─ Has Many: ChallanItem[]

ChallanItem (id, challanId, productId, productNameSnapshot, skuSnapshot, unitPriceSnapshot, quantity, totalPrice)
  ├─ Belongs To: Challan
  └─ Belongs To: Product
```

---

## 4. Business Processes & Operational Workflows

### A. Sales Delivery Challan Lifecycle:

1. **Draft Creation & Number Generation:** Sales user selects a customer and creates a draft. The system automatically assigns the next sequential challan number (`CH-0001`, `CH-0002`).
2. **Line Item Attachment & Historical Price Snapshotting:** Product rows are added. The system captures the current price, product name, and SKU into snapshot fields to protect past records from future price updates.
3. **Stock Pre-Check & Confirmation (Atomic Transaction):** Upon clicking Confirm, a Prisma transaction checks current stock. If sufficient (`currentStock >= quantity`), stock is decremented and an `OUT` movement is recorded. If stock is insufficient, the operation aborts with a HTTP 400 error.
4. **Challan Cancellation & Inventory Restoration:** If a confirmed delivery is cancelled, an atomic transaction restores the exact quantities back into product stock and logs an `IN` stock movement record.

### B. Stock Movement & Inventory Audit Process:

1. **Manual Stock Adjustment:** Warehouse personnel can record direct `IN` (vendor restocking) or `OUT` (damaged goods/returns) movements with required audit reasons.
2. **Automated Low-Stock Triggering:** System automatically calculates `currentStock <= minimumStock` and surfaces visual alerts across Dashboard, Product Catalog, and Inventory screens.

---

## 5. Role-Based Access Control (RBAC) Matrix

| Module / Operation | ADMIN | SALES | WAREHOUSE | ACCOUNTS |
|--------------------|-------|-------|-----------|----------|
| **View Dashboard KPIs** | Allowed | Allowed | Allowed | Allowed |
| **Create / Edit Customers** | Allowed | Allowed | Read Only | Read Only |
| **Schedule Customer Follow-ups** | Allowed | Allowed | Read Only | Read Only |
| **Create / Edit Products** | Allowed | Read Only | Allowed | Read Only |
| **Record Stock Movements (IN/OUT)** | Allowed | Read Only | Allowed | Read Only |
| **Create & Confirm Sales Challans** | Allowed | Allowed | Allowed | Read Only |

---

## 6. Complete REST API Specifications

All endpoints accept and return JSON. Authenticated endpoints require `Authorization: Bearer <token>` header.

| HTTP Method | Endpoint Path | Description | Authorized Roles |
|-------------|---------------|-------------|------------------|
| POST | `/api/auth/login` | Authenticate user credentials & issue JWT token | Public |
| GET | `/api/auth/me` | Retrieve profile of authenticated user | All Roles |
| GET | `/api/dashboard/summary` | Fetch aggregate high-level metrics | All Roles |
| GET | `/api/dashboard/details` | Fetch recent activity tables | All Roles |
| GET | `/api/customers` | Search & list customers with filters | All Roles |
| GET | `/api/customers/:id` | Fetch customer profile, follow-ups & challans | All Roles |
| POST | `/api/customers` | Create new customer profile | Admin, Sales |
| PUT | `/api/customers/:id` | Update existing customer profile | Admin, Sales |
| GET | `/api/followups` | List all customer follow-up entries | All Roles |
| POST | `/api/followups` | Record new customer follow-up entry | Admin, Sales |
| GET | `/api/products` | List product catalog | All Roles |
| POST | `/api/products` | Add new product item | Admin, Warehouse |
| PUT | `/api/products/:id` | Update existing product catalog details | Admin, Warehouse |
| GET | `/api/products/low-stock` | Fetch products at or below alert stock threshold | Admin, Warehouse, Accounts |
| GET | `/api/products/stock/movements` | Fetch master audit log of stock movements | All Roles |
| POST | `/api/products/:id/stock` | Log manual stock adjustment (IN/OUT) | Admin, Warehouse |
| GET | `/api/challans` | List delivery challans | All Roles |
| GET | `/api/challans/:id` | Fetch delivery challan details with line items | All Roles |
| POST | `/api/challans` | Create draft delivery challan | Admin, Sales, Warehouse |
| POST | `/api/challans/:id/items` | Add line item snapshot to draft challan | Admin, Sales, Warehouse |
| POST | `/api/challans/:id/confirm` | Confirm challan & deduct inventory stock | Admin, Sales, Warehouse |
| POST | `/api/challans/:id/cancel` | Cancel challan & restore inventory stock | Admin, Sales, Warehouse |

---

## 7. Production Deployment & Infrastructure

### Live Production Endpoints:

- **Frontend Application:** [https://mini-erp-crm-phi.vercel.app](https://mini-erp-crm-phi.vercel.app) (Hosted on Vercel CDN)
- **Backend REST API:** [https://mini-erp-crm-backend-rf4i.onrender.com](https://mini-erp-crm-backend-rf4i.onrender.com) (Hosted on Render)
- **PostgreSQL Database:** Neon Cloud PostgreSQL Serverless cluster

### Production Environment Variables Configured:

```env
# Render Backend Environment Variables
DATABASE_URL="postgresql://neondb_owner:npg_VoNi4TCm8XYt@ep-cold-leaf-aytf7o1y.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="mini-erp-secret-key-2026-production"
PORT=5000
FRONTEND_URL="https://mini-erp-crm-phi.vercel.app"

# Vercel Frontend Environment Variables
VITE_API_URL="https://mini-erp-crm-backend-rf4i.onrender.com/api"
```

---

## 8. Demo Test Credentials

All pre-seeded demo accounts share the universal development password: `password123`

| Role | Email | Password | Primary Access Scope |
|------|-------|----------|----------------------|
| **Admin** | `admin@erp.com` | `password123` | Full system control & configuration |
| **Sales** | `sales@erp.com` | `password123` | Customer CRM, follow-ups, draft & confirm challans |
| **Warehouse** | `warehouse@erp.com` | `password123` | Product catalog, stock IN/OUT adjustments, confirm challans |
| **Accounts** | `accounts@erp.com` | `password123` | Read-only financial and audit reporting |

---

## 9. System Assumptions & Technical Limitations

- **Single-Tenant Architecture:** The current system operates for one organization. Multi-tenancy isolation can be added via organization ID scoping.
- **Client-Side Session Termination:** JWT tokens operate on stateless verification. Token invalidation on logout is handled client-side by purging local storage.
- **Standard Web Delivery Formats:** Print/PDF exports leverage CSS3 print stylesheets (`@media print`) rendering clean delivery challan invoices.
