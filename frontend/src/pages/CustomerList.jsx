import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getCustomers } from "../api/customer.api";
import { canAccess } from "../utils/roleConfig";


// =====================================================
// CUSTOMER LIST
// =====================================================

const CustomerList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");


  // ---------------------------------------------------
  // Load customers
  // ---------------------------------------------------

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getCustomers();
        if (data.success) {
          setCustomers(data.customers);
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Failed to load customers"
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);


  // ---------------------------------------------------
  // Filter
  // ---------------------------------------------------

  const filtered = customers.filter((c) => {
    const matchesSearch =
      !search ||
      c.customerName.toLowerCase().includes(search.toLowerCase()) ||
      c.mobile.includes(search) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
      (c.businessName && c.businessName.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      !statusFilter || c.status === statusFilter;

    const matchesType =
      !typeFilter || c.customerType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });


  // ---------------------------------------------------
  // Loading / Error
  // ---------------------------------------------------

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner" />
        Loading customers...
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-state error-state">{error}</div>
    );
  }


  return (
    <div>

      {/* Header */}
      <div className="page-header">
        <div>
          <h2>Customers</h2>
          <p>{customers.length} total customers</p>
        </div>

        <div className="page-header-actions">
          {canAccess(user?.role, "customers", "create") && (
            <button
              className="btn btn-primary"
              onClick={() => navigate("/customers/new")}
            >
              + Add Customer
            </button>
          )}
        </div>
      </div>


      {/* Search + Filters */}
      <div className="search-bar">
        <input
          className="search-input"
          type="text"
          placeholder="Search by name, mobile, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="LEAD">Lead</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>

        <select
          className="filter-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="RETAIL">Retail</option>
          <option value="WHOLESALE">Wholesale</option>
          <option value="DISTRIBUTOR">Distributor</option>
        </select>
      </div>


      {/* Table */}
      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state">
            No customers found.
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Mobile</th>
                  <th>Business</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Follow-up</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="clickable-row"
                    onClick={() =>
                      navigate(`/customers/${c.id}`)
                    }
                  >
                    <td>
                      <strong>{c.customerName}</strong>
                      {c.email && (
                        <small>{c.email}</small>
                      )}
                    </td>

                    <td>{c.mobile}</td>

                    <td>{c.businessName || "-"}</td>

                    <td>
                      <span
                        className={`status-badge status-${String(
                          c.customerType
                        ).toLowerCase()}`}
                      >
                        {c.customerType}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`status-badge status-${String(
                          c.status
                        ).toLowerCase()}`}
                      >
                        {c.status}
                      </span>
                    </td>

                    <td>
                      {c.followUpDate
                        ? new Date(
                            c.followUpDate
                          ).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};


export default CustomerList;
