import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getCustomerById } from "../api/customer.api";
import { createFollowUp } from "../api/followup.api";
import { canAccess } from "../utils/roleConfig";


// =====================================================
// CUSTOMER DETAIL
// =====================================================

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Follow-up form
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpNotes, setFollowUpNotes] = useState("");
  const [followUpError, setFollowUpError] = useState("");
  const [followUpSubmitting, setFollowUpSubmitting] = useState(false);


  // ---------------------------------------------------
  // Load customer
  // ---------------------------------------------------

  const loadCustomer = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getCustomerById(id);

      if (data.success) {
        setCustomer(data.customer);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to load customer"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomer();
  }, [id]);


  // ---------------------------------------------------
  // Submit follow-up
  // ---------------------------------------------------

  const handleFollowUpSubmit = async (e) => {
    e.preventDefault();
    setFollowUpError("");
    setFollowUpSubmitting(true);

    try {
      const data = await createFollowUp({
        customerId: Number(id),
        followUpDate,
        notes: followUpNotes,
      });

      if (data.success) {
        setShowFollowUpForm(false);
        setFollowUpDate("");
        setFollowUpNotes("");
        loadCustomer(); // Refresh
      }
    } catch (err) {
      setFollowUpError(
        err.response?.data?.message ||
        "Failed to create follow-up"
      );
    } finally {
      setFollowUpSubmitting(false);
    }
  };


  // ---------------------------------------------------
  // Loading / Error
  // ---------------------------------------------------

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner" />
        Loading customer...
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-state error-state">{error}</div>
    );
  }

  if (!customer) return null;


  return (
    <div>
      <Link to="/customers" className="back-link">
        ← Back to Customers
      </Link>


      {/* Header */}
      <div className="page-header">
        <div>
          <h2>{customer.customerName}</h2>
          <p>Customer #{customer.id}</p>
        </div>

        <div className="page-header-actions">
          {canAccess(user?.role, "customers", "edit") && (
            <button
              className="btn btn-secondary"
              onClick={() =>
                navigate(`/customers/${id}/edit`)
              }
            >
              ✎ Edit
            </button>
          )}

          {canAccess(user?.role, "followups", "create") && (
            <button
              className="btn btn-primary"
              onClick={() =>
                setShowFollowUpForm(!showFollowUpForm)
              }
            >
              + Follow-up
            </button>
          )}
        </div>
      </div>


      {/* Info Card */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="info-grid">
            <div className="info-item">
              <label>Mobile</label>
              <span>{customer.mobile}</span>
            </div>

            <div className="info-item">
              <label>Email</label>
              <span>{customer.email || "-"}</span>
            </div>

            <div className="info-item">
              <label>Business Name</label>
              <span>{customer.businessName || "-"}</span>
            </div>

            <div className="info-item">
              <label>GST Number</label>
              <span>{customer.gstNumber || "-"}</span>
            </div>

            <div className="info-item">
              <label>Type</label>
              <span
                className={`status-badge status-${String(
                  customer.customerType
                ).toLowerCase()}`}
              >
                {customer.customerType}
              </span>
            </div>

            <div className="info-item">
              <label>Status</label>
              <span
                className={`status-badge status-${String(
                  customer.status
                ).toLowerCase()}`}
              >
                {customer.status}
              </span>
            </div>

            <div className="info-item">
              <label>Address</label>
              <span>{customer.address || "-"}</span>
            </div>

            <div className="info-item">
              <label>Follow-up Date</label>
              <span>
                {customer.followUpDate
                  ? new Date(
                      customer.followUpDate
                    ).toLocaleDateString()
                  : "-"}
              </span>
            </div>

            <div className="info-item">
              <label>Notes</label>
              <span>{customer.notes || "-"}</span>
            </div>

            <div className="info-item">
              <label>Created</label>
              <span>
                {new Date(
                  customer.createdAt
                ).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>


      {/* Follow-up Form (Modal-like) */}
      {showFollowUpForm && (
        <div className="card mb-6">
          <div className="card-header">
            <h3>Add Follow-up</h3>
          </div>
          <div className="card-body">
            {followUpError && (
              <div className="alert alert-error">
                {followUpError}
              </div>
            )}

            <form onSubmit={handleFollowUpSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>
                    Follow-up Date
                    <span className="required">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={followUpDate}
                    onChange={(e) =>
                      setFollowUpDate(e.target.value)
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Notes
                    <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={followUpNotes}
                    onChange={(e) =>
                      setFollowUpNotes(e.target.value)
                    }
                    placeholder="Follow-up notes..."
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={followUpSubmitting}
                >
                  {followUpSubmitting
                    ? "Saving..."
                    : "Save Follow-up"}
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() =>
                    setShowFollowUpForm(false)
                  }
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Follow-ups History */}
      <div className="detail-section">
        <h3>
          Follow-ups ({customer.followUps?.length || 0})
        </h3>

        <div className="card">
          {(!customer.followUps ||
            customer.followUps.length === 0) ? (
            <div className="empty-state">
              No follow-ups recorded.
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Notes</th>
                    <th>Created By</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.followUps.map((f) => (
                    <tr key={f.id}>
                      <td>
                        {new Date(
                          f.followUpDate
                        ).toLocaleString()}
                      </td>
                      <td>{f.notes}</td>
                      <td>{f.createdBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>


      {/* Challans History */}
      <div className="detail-section">
        <h3>
          Challans ({customer.challans?.length || 0})
        </h3>

        <div className="card">
          {(!customer.challans ||
            customer.challans.length === 0) ? (
            <div className="empty-state">
              No challans for this customer.
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Challan #</th>
                    <th>Quantity</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.challans.map((c) => (
                    <tr
                      key={c.id}
                      className="clickable-row"
                      onClick={() =>
                        navigate(`/challans/${c.id}`)
                      }
                    >
                      <td>
                        <strong>
                          {c.challanNumber}
                        </strong>
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
                      <td>
                        {new Date(
                          c.createdAt
                        ).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};


export default CustomerDetail;
