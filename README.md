# Mini ERP CRM

A full-stack ERP/CRM application for managing customers, products, inventory, and delivery challans with role-based access control.

---

## Features

- **Authentication** — JWT-based login with 4 distinct roles (Admin, Sales, Warehouse, Accounts)
- **Dashboard** — KPI cards with real-time counts + detail tables (follow-ups, low stock, challans, movements)
- **Customer Management** — Full CRUD with search, filter by status/type, follow-up tracking
- **Product Catalog** — Full CRUD with SKU, pricing, stock thresholds, low-stock alerts
- **Inventory Management** — Stock IN/OUT movements with audit trail, real-time stock levels
- **Delivery Challans** — Multi-step creation (draft → add items → confirm), stock auto-deduction on confirm, stock restoration on cancel
- **PDF / Print Invoice** — Export delivery challans as clean printable invoices / PDFs
- **Follow-up Tracking** — Schedule and track customer follow-ups
- **Role-Based Access Control** — Menu visibility and action buttons adapt per role; backend enforces 403s
- **Docker Support** — 1-command containerized setup with Docker Compose

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, React Router v7, Vite 8 |
| Styling | Vanilla CSS (custom design system + `@media print` invoice view) |
| HTTP Client | Axios with JWT interceptors |
| Backend | Node.js, Express.js |
| Database | PostgreSQL (Neon / Local Docker) |
| ORM | Prisma with `@prisma/adapter-pg` |
| Auth | JWT (jsonwebtoken) + bcrypt |
| Containerization | Docker & Docker Compose |
| Deployment | Vercel (frontend) + Render (backend) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                     │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐  │
│  │ Login   │  │Dashboard │  │Customers │  │Challans │  │
│  │ Page    │  │  Page    │  │ CRUD     │  │Builder  │  │
│  └────┬────┘  └────┬─────┘  └────┬─────┘  └────┬────┘  │
│       │            │             │              │        │
│  ┌────▼────────────▼─────────────▼──────────────▼────┐  │
│  │              Axios Instance (Bearer Token)         │  │
│  └────────────────────────┬──────────────────────────┘  │
└───────────────────────────┼──────────────────────────────┘
                            │ HTTPS
┌───────────────────────────▼──────────────────────────────┐
│                    BACKEND (Express)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐               │
│  │   Auth   │  │  Role    │  │  Error   │               │
│  │Middleware │  │Middleware│  │ Handler  │               │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘               │
│       │              │             │                      │
│  ┌────▼──────────────▼─────────────▼─────────────────┐   │
│  │  Routes → Controllers → Services → Prisma ORM     │   │
│  └─────────────────────────┬─────────────────────────┘   │
└────────────────────────────┼─────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   PostgreSQL    │
                    │   (Neon DB)     │
                    └─────────────────┘
```

---

## Database Schema

```
User (id, name, email, passwordHash, role, timestamps)
  └─ role: ADMIN | SALES | WAREHOUSE | ACCOUNTS

Customer (id, customerName, mobile, email, businessName, gstNumber,
          customerType, address, status, followUpDate, notes, timestamps)
  ├─ customerType: RETAIL | WHOLESALE | DISTRIBUTOR
  ├─ status: LEAD | ACTIVE | INACTIVE
  ├─ → FollowUp[]
  └─ → Challan[]

FollowUp (id, customerId, followUpDate, notes, createdBy, createdAt)
  └─ → Customer

Product (id, name, sku, category, unitPrice, currentStock,
         minimumStock, warehouseLocation, timestamps)
  ├─ → ChallanItem[]
  └─ → StockMovement[]

StockMovement (id, productId, quantity, movementType, reason, createdBy, createdAt)
  ├─ movementType: IN | OUT
  └─ → Product

Challan (id, challanNumber, customerId, totalQuantity, status, createdBy, createdAt)
  ├─ status: DRAFT | CONFIRMED | CANCELLED
  ├─ → Customer
  └─ → ChallanItem[]

ChallanItem (id, challanId, productId, productNameSnapshot, skuSnapshot,
             unitPriceSnapshot, quantity, totalPrice)
  ├─ → Challan
  └─ → Product
```

---

## API Documentation

A complete Postman collection is included in the project root: `postman_collection.json`.

### Authentication
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/api/auth/login` | Login with email/password | Public |
| GET | `/api/auth/me` | Get authenticated user | All |

### Dashboard
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/dashboard/summary` | KPI counts | All |
| GET | `/api/dashboard/details` | Recent data lists | All |

### Customers
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/customers` | List all customers | All |
| GET | `/api/customers/:id` | Get customer with follow-ups & challans | All |
| POST | `/api/customers` | Create customer | ADMIN, SALES |
| PUT | `/api/customers/:id` | Update customer | ADMIN, SALES |

### Follow-ups
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/followups` | List all follow-ups | All |
| GET | `/api/followups/:id` | Get follow-up by ID | All |
| POST | `/api/followups` | Create follow-up | ADMIN, SALES |

### Products
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/products` | List all products | All |
| GET | `/api/products/:id` | Get product by ID | All |
| GET | `/api/products/low-stock` | Get low-stock products | ADMIN, WAREHOUSE, ACCOUNTS |
| POST | `/api/products` | Create product | ADMIN, WAREHOUSE |
| PUT | `/api/products/:id` | Update product | ADMIN, WAREHOUSE |

### Stock
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/products/stock/movements` | All stock movements | All |
| GET | `/api/products/:id/stock` | Product stock + movements | All |
| POST | `/api/products/:id/stock` | Create stock movement | ADMIN, WAREHOUSE |

### Challans
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/challans` | List all challans | All |
| GET | `/api/challans/:id` | Get challan with items | All |
| POST | `/api/challans` | Create draft challan | ADMIN, SALES, WAREHOUSE |
| POST | `/api/challans/:id/items` | Add item to draft | ADMIN, SALES, WAREHOUSE |
| POST | `/api/challans/:id/confirm` | Confirm challan (deducts stock) | ADMIN, SALES, WAREHOUSE |
| POST | `/api/challans/:id/cancel` | Cancel confirmed challan (restores stock) | ADMIN, SALES, WAREHOUSE |

---

## Quick Start with Docker (Recommended)

Run the entire application (PostgreSQL, Express API, Vite Frontend) with a single command:

```bash
docker compose up --build
```

Access the application:
- **Frontend App**: `http://localhost:8080`
- **Backend API**: `http://localhost:5000/api`
- **PostgreSQL**: `localhost:5432`

---

## Local Setup (Without Docker)

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Neon account)

### 1. Backend setup
```bash
cd backend
npm install
```

Create `.env`:
```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your-secret-key
PORT=5000
FRONTEND_URL=http://localhost:5173
```

Generate Prisma client & run migrations:
```bash
npx prisma generate
npx prisma migrate dev
```

Seed the database:
```bash
node prisma/seed.js
```

Start the server:
```bash
node src/server.js
```

### 2. Frontend setup
```bash
cd frontend
npm install
```

Create `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the dev server:
```bash
npm run dev
```

---

## Deployment

### Backend → Render
1. Push `backend/` to GitHub
2. Create a new Web Service on Render
3. Set build command: `npm install && npx prisma generate`
4. Set start command: `node src/server.js`
5. Add environment variables: `DATABASE_URL`, `JWT_SECRET`, `PORT`, `FRONTEND_URL`

### Frontend → Vercel
1. Push `frontend/` to GitHub
2. Import the repository on Vercel
3. Set root directory to `frontend`
4. Add environment variable: `VITE_API_URL` pointing to your Render backend URL
5. Deploy

---

## Test Credentials

All accounts use password: `password123`

| Role | Email | Access Level |
|------|-------|-------------|
| Admin | admin@erp.com | Full access to all features |
| Sales | sales@erp.com | Customers, follow-ups, challans (no inventory write) |
| Warehouse | warehouse@erp.com | Products, inventory, challans (no customer write) |
| Accounts | accounts@erp.com | Read-only across all modules |

---

## Business Logic & Assumptions

- Single-tenant application (one company)
- JWT tokens expire after 1 hour
- Challan numbers are auto-generated (`CH-0001`, `CH-0002`, etc.)
- Product snapshots in challans preserve pricing at time of creation
- Stock movements are immutable (no editing after creation)
- Confirming a challan atomically deducts stock for all items
- Cancelling a confirmed challan atomically restores stock

---

## Known Limitations

- No pagination on list endpoints (all records loaded at once)
- No file upload support (e.g., product images to S3)
- No email notifications for follow-up reminders
- JWT tokens cannot be revoked server-side (logout is client-side only)
- No password reset or user registration (admin seeds users)

---

## Project Structure

```
mini-erp-crm/
├── docker-compose.yml             # Docker Compose orchestration
├── postman_collection.json        # Postman REST API collection
├── README.md                      # Documentation
│
├── backend/
│   ├── Dockerfile                 # Backend container image
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   ├── seed.js                # Database seeder
│   │   └── migrations/            # Prisma migrations
│   └── src/
│       ├── server.js              # Entry point
│       ├── app.js                 # Express app setup
│       ├── controllers/           # Route handlers
│       ├── middleware/            # Auth, role, error handling
│       ├── routes/                # API route definitions
│       └── lib/                   # Prisma client
│
└── frontend/
    ├── Dockerfile                 # Frontend Nginx container image
    ├── index.html                 # HTML entry
    ├── vercel.json                # Vercel SPA config
    ├── vite.config.js             # Vite config
    └── src/
        ├── main.jsx               # React entry
        ├── App.jsx                # Root component
        ├── index.css              # Design system & print styles
        ├── api/                   # API service layer
        ├── components/            # Shared components
        ├── context/               # Auth context
        ├── layouts/               # Dashboard layout
        ├── pages/                 # Page components
        ├── routes/                # Route config
        └── utils/                 # Role config
```
