import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getFollowUps, createFollowUp } from "../api/followup.api";
import { getCustomers } from "../api/customer.api";
import { canAccess } from "../utils/roleConfig";


// =====================================================
// FOLLOW-UP LIST
// =====================================================

const FollowUpList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [followUps, setFollowUps] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add form
  const [showForm, setShowForm] = useState(false);
  const [formCustomerId, setFormCustomerId] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);


  // ---------------------------------------------------
  // Load data
  // ---------------------------------------------------

  const loadData = async () => {
    try {
      setLoading(true);
      const [fData, cData] = await Promise.all([
        getFollowUps(),
        canAccess(user?.role, "followups", "create")
          ? getCustomers()
          : Promise.resolve({ customers: [] }),
      ]);

      if (fData.success) setFollowUps(fData.followUps);
      if (cData.success) setCustomers(cData.customers);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to load follow-ups"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);


  // ---------------------------------------------------
  // Submit
  // ---------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    try {
      const data = await createFollowUp({
        customerId: Number(formCustomerId),
        followUpDate: formDate,
        notes: formNotes,
      });

      if (data.success) {
        setShowForm(false);
        setFormCustomerId("");
        setFormDate("");
        setFormNotes("");
        loadData();
      }
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
        "Failed to create follow-up"
      );
    } finally {
      setSubmitting(false);
    }
  };


  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner" />
        Loading follow-ups...
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

      <div className="page-header">
        <div>
          <h2>Follow-ups</h2>
          <p>{followUps.length} total follow-ups</p>
        </div>

        <div className="page-header-actions">
          {canAccess(user?.role, "followups", "create") && (
            <button
              className="btn btn-primary"
              onClick={() => setShowForm(!showForm)}
            >
              + Add Follow-up
            </button>
          )}
        </div>
      </div>


      {/* Add Form */}
      {showForm && (
        <div className="card mb-6">
          <div className="card-header">
            <h3>New Follow-up</h3>
          </div>
          <div className="card-body">
            {formError && (
              <div className="alert alert-error">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>
                    Customer
                    <span className="required">*</span>
                  </label>
                  <select
                    value={formCustomerId}
                    onChange={(e) =>
                      setFormCustomerId(e.target.value)
                    }
                    required
                  >
                    <option value="">
                      Select customer...
                    </option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.customerName}
                        {c.businessName
                          ? ` (${c.businessName})`
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Date
                    <span className="required">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formDate}
                    onChange={(e) =>
                      setFormDate(e.target.value)
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  Notes
                  <span className="required">*</span>
                </label>
                <textarea
                  value={formNotes}
                  onChange={(e) =>
                    setFormNotes(e.target.value)
                  }
                  placeholder="Follow-up notes..."
                  required
                />
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting
                    ? "Saving..."
                    : "Create Follow-up"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Table */}
      <div className="card">
        {followUps.length === 0 ? (
          <div className="empty-state">
            No follow-ups recorded yet.
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Follow-up Date</th>
                  <th>Notes</th>
                  <th>Created By</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {followUps.map((f) => (
                  <tr
                    key={f.id}
                    className="clickable-row"
                    onClick={() =>
                      navigate(
                        `/customers/${f.customer?.id}`
                      )
                    }
                  >
                    <td>
                      <strong>
                        {f.customer?.customerName}
                      </strong>
                      {f.customer?.businessName && (
                        <small>
                          {f.customer.businessName}
                        </small>
                      )}
                    </td>
                    <td>
                      {new Date(
                        f.followUpDate
                      ).toLocaleString()}
                    </td>
                    <td>{f.notes}</td>
                    <td>{f.createdBy}</td>
                    <td>
                      {new Date(
                        f.createdAt
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
  );
};


export default FollowUpList;
