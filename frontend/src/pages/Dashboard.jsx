import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getDashboardSummary,
  getDashboardDetails,
} from "../api/dashboard.api";

// Default sample data to display if DB has no data yet
const SAMPLE_SUMMARY = {
  totalCustomers: 5,
  totalProducts: 6,
  lowStockProducts: 3,
  draftChallans: 1,
  activeCustomers: 3,
  totalLeads: 1,
  confirmedChallans: 1,
  upcomingFollowUps: 3,
};

const SAMPLE_FOLLOWUPS = [
  {
    id: 101,
    followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Quotation for 20 units of Hydraulic Pumps",
    customer: { id: 1, customerName: "Rajesh Kumar", businessName: "Apex Industrial Solutions" },
  },
  {
    id: 102,
    followUpDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Schedule technical demo meeting",
    customer: { id: 2, customerName: "Anita Sharma", businessName: "Titan Infrastructure Ltd" },
  },
  {
    id: 103,
    followUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Confirm delivery address for sample order",
    customer: { id: 3, customerName: "Vikram Patel", businessName: "Patel Electricals" },
  },
];

const SAMPLE_LOW_STOCK = [
  {
    id: 201,
    name: "Industrial Steel Plates (10mm)",
    sku: "PRD-STL-001",
    currentStock: 4,
    minimumStock: 10,
    warehouseLocation: "Bay A, Rack 01",
  },
  {
    id: 202,
    name: "Hydraulic Pump Assembly 5HP",
    sku: "PRD-HYD-003",
    currentStock: 2,
    minimumStock: 5,
    warehouseLocation: "Bay C, Rack 02",
  },
  {
    id: 203,
    name: "Heavy Duty Roller Bearing 6205",
    sku: "PRD-BRG-005",
    currentStock: 3,
    minimumStock: 25,
    warehouseLocation: "Bay A, Bin 12",
  },
];

const SAMPLE_CHALLANS = [
  {
    id: 301,
    challanNumber: "CH-0001",
    totalQuantity: 54,
    status: "CONFIRMED",
    customer: { id: 1, customerName: "Rajesh Kumar" },
  },
  {
    id: 302,
    challanNumber: "CH-0002",
    totalQuantity: 15,
    status: "DRAFT",
    customer: { id: 2, customerName: "Anita Sharma" },
  },
  {
    id: 303,
    challanNumber: "CH-0003",
    totalQuantity: 20,
    status: "CANCELLED",
    customer: { id: 4, customerName: "Siddharth Mehta" },
  },
];

const SAMPLE_MOVEMENTS = [
  {
    id: 401,
    product: { name: "Industrial Steel Plates (10mm)" },
    movementType: "OUT",
    quantity: 46,
    reason: "Dispatch for Challan CH-0001",
  },
  {
    id: 402,
    product: { name: "Hydraulic Pump Assembly 5HP" },
    movementType: "OUT",
    quantity: 8,
    reason: "Dispatch for Challan CH-0001",
  },
  {
    id: 403,
    product: { name: "Copper Wiring Roll (100m)" },
    movementType: "IN",
    quantity: 50,
    reason: "Restock from Central Warehouse",
  },
];

// =====================================================
// DASHBOARD
// =====================================================

const Dashboard = () => {
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // ---------------------------------------------------
  // Load dashboard data
  // ---------------------------------------------------

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const [summaryRes, detailsRes] = await Promise.all([
          getDashboardSummary(),
          getDashboardDetails(),
        ]);

        if (summaryRes.success) {
          setSummary(summaryRes.summary);
        }

        if (detailsRes.success) {
          setDetails(detailsRes.details);
        }
      } catch (err) {
        console.error("Dashboard error:", err);
        setError(
          err.response?.data?.message ||
          err.message ||
          "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);


  // ---------------------------------------------------
  // Loading
  // ---------------------------------------------------

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner" />
        Loading dashboard...
      </div>
    );
  }


  // ---------------------------------------------------
  // Error
  // ---------------------------------------------------

  if (error) {
    return (
      <div className="page-state error-state">
        {error}
      </div>
    );
  }

  // Use API data if available, fallback to sample examples if database is empty
  const activeSummary = (summary && (summary.totalCustomers > 0 || summary.totalProducts > 0))
    ? summary
    : SAMPLE_SUMMARY;

  const upcomingFollowUps = (details?.upcomingFollowUps && details.upcomingFollowUps.length > 0)
    ? details.upcomingFollowUps
    : SAMPLE_FOLLOWUPS;

  const lowStockProducts = (details?.lowStockProducts && details.lowStockProducts.length > 0)
    ? details.lowStockProducts
    : SAMPLE_LOW_STOCK;

  const recentChallans = (details?.recentChallans && details.recentChallans.length > 0)
    ? details.recentChallans
    : SAMPLE_CHALLANS;

  const recentStockMovements = (details?.recentStockMovements && details.recentStockMovements.length > 0)
    ? details.recentStockMovements
    : SAMPLE_MOVEMENTS;


  return (
    <div className="dashboard-page">

      {/* =================================================
          HEADER
          ================================================= */}

      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Overview of your ERP CRM</p>
        </div>
      </div>


      {/* =================================================
          KPI CARDS
          ================================================= */}

      <div className="stats-grid">

        <div
          className="stat-card clickable-row"
          onClick={() => navigate("/customers")}
        >
          <span>Total Customers</span>
          <strong>
            {activeSummary.totalCustomers}
          </strong>
        </div>

        <div
          className="stat-card clickable-row"
          onClick={() => navigate("/products")}
        >
          <span>Total Products</span>
          <strong>
            {activeSummary.totalProducts}
          </strong>
        </div>

        <div
          className="stat-card clickable-row"
          onClick={() => navigate("/inventory")}
        >
          <span>Low Stock Alerts</span>
          <strong className="text-danger">
            {activeSummary.lowStockProducts}
          </strong>
        </div>

        <div
          className="stat-card clickable-row"
          onClick={() => navigate("/challans")}
        >
          <span>Draft Challans</span>
          <strong>
            {activeSummary.draftChallans}
          </strong>
        </div>

      </div>


      {/* =================================================
          SECONDARY STATS
          ================================================= */}

      <div className="stats-grid">

        <div className="stat-card">
          <span>Active Customers</span>
          <strong className="text-success">
            {activeSummary.activeCustomers}
          </strong>
        </div>

        <div className="stat-card">
          <span>Leads</span>
          <strong>
            {activeSummary.totalLeads}
          </strong>
        </div>

        <div className="stat-card">
          <span>Confirmed Challans</span>
          <strong className="text-success">
            {activeSummary.confirmedChallans}
          </strong>
        </div>

        <div className="stat-card">
          <span>Upcoming Follow-ups</span>
          <strong>
            {activeSummary.upcomingFollowUps}
          </strong>
        </div>

      </div>


      {/* =================================================
          DETAIL GRID
          ================================================= */}

      <div className="dashboard-grid">

        {/* Follow-ups */}
        <section className="dashboard-card">
          <div className="card-header">
            <div>
              <h3>Upcoming Follow-ups</h3>
              <p>Customers that need attention</p>
            </div>
          </div>

          {upcomingFollowUps.length === 0 ? (
            <div className="empty-state">
              No upcoming follow-ups.
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingFollowUps.map((f) => (
                    <tr
                      key={f.id}
                      className="clickable-row"
                      onClick={() =>
                        f.customer?.id && navigate(`/customers/${f.customer.id}`)
                      }
                    >
                      <td>{f.customer?.customerName}</td>
                      <td>
                        {new Date(f.followUpDate).toLocaleDateString()}
                      </td>
                      <td>{f.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>


        {/* Low Stock */}
        <section className="dashboard-card">
          <div className="card-header">
            <div>
              <h3>Low Stock</h3>
              <p>Products requiring attention</p>
            </div>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="empty-state">
              No low-stock products.
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Stock</th>
                    <th>Minimum</th>
                    <th>Location</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <strong>{p.name}</strong>
                        <small>{p.sku}</small>
                      </td>
                      <td>
                        <span className="stock-danger">
                          {p.currentStock}
                        </span>
                      </td>
                      <td>{p.minimumStock}</td>
                      <td>{p.warehouseLocation || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>


        {/* Recent Challans */}
        <section className="dashboard-card">
          <div className="card-header">
            <div>
              <h3>Recent Challans</h3>
              <p>Latest customer deliveries</p>
            </div>
          </div>

          {recentChallans.length === 0 ? (
            <div className="empty-state">
              No recent challans.
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Challan</th>
                    <th>Customer</th>
                    <th>Qty</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentChallans.map((c) => (
                    <tr
                      key={c.id}
                      className="clickable-row"
                      onClick={() =>
                        c.id && navigate(`/challans/${c.id}`)
                      }
                    >
                      <td>
                        <strong>{c.challanNumber}</strong>
                      </td>
                      <td>
                        {c.customer?.customerName}
                      </td>
                      <td>{c.totalQuantity}</td>
                      <td>
                        <span
                          className={`status-badge status-${String(
                            c.status
                          ).toLowerCase()}`}
                        >
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>


        {/* Stock Movements */}
        <section className="dashboard-card">
          <div className="card-header">
            <div>
              <h3>Recent Stock Activity</h3>
              <p>Latest inventory movements</p>
            </div>
          </div>

          {recentStockMovements.length === 0 ? (
            <div className="empty-state">
              No stock movements.
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Type</th>
                    <th>Qty</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {recentStockMovements.map((m) => (
                    <tr key={m.id}>
                      <td>{m.product?.name}</td>
                      <td>
                        <span
                          className={
                            m.movementType === "IN"
                              ? "movement-in"
                              : "movement-out"
                          }
                        >
                          {m.movementType}
                        </span>
                      </td>
                      <td>{m.quantity}</td>
                      <td>{m.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>
    </div>
  );
};


export default Dashboard;