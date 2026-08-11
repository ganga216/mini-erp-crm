import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getChallanById,
  confirmChallan,
  cancelChallan,
} from "../api/challan.api";
import { canAccess } from "../utils/roleConfig";


// =====================================================
// CHALLAN DETAIL
// =====================================================

const ChallanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [challan, setChallan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);


  // ---------------------------------------------------
  // Load challan
  // ---------------------------------------------------

  const loadChallan = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getChallanById(id);

      if (data.success) {
        setChallan(data.challan);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to load challan"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChallan();
  }, [id]);


  // ---------------------------------------------------
  // Confirm
  // ---------------------------------------------------

  const handleConfirm = async () => {
    if (
      !window.confirm(
        "Confirm this challan? Stock will be deducted for all items."
      )
    ) {
      return;
    }

    setActionLoading(true);
    setError("");

    try {
      const data = await confirmChallan(id);

      if (data.success) {
        loadChallan();
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to confirm challan"
      );
    } finally {
      setActionLoading(false);
    }
  };


  // ---------------------------------------------------
  // Cancel
  // ---------------------------------------------------

  const handleCancel = async () => {
    if (
      !window.confirm(
        "Cancel this challan? Stock will be restored for all items."
      )
    ) {
      return;
    }

    setActionLoading(true);
    setError("");

    try {
      const data = await cancelChallan(id);

      if (data.success) {
        loadChallan();
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to cancel challan"
      );
    } finally {
      setActionLoading(false);
    }
  };


  // ---------------------------------------------------
  // Loading / Error
  // ---------------------------------------------------

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner" />
        Loading challan...
      </div>
    );
  }

  if (error && !challan) {
    return (
      <div className="page-state error-state">{error}</div>
    );
  }

  if (!challan) return null;


  // ---------------------------------------------------
  // Compute totals
  // ---------------------------------------------------

  const totalPrice = (challan.items || []).reduce(
    (sum, item) => sum + item.totalPrice,
    0
  );


  return (
    <div>
      <Link to="/challans" className="back-link">
        ← Back to Challans
      </Link>


      {/* Header */}
      <div className="page-header">
        <div>
          <h2>
            Challan {challan.challanNumber}
          </h2>
          <p>
            Created on{" "}
            {new Date(
              challan.createdAt
            ).toLocaleString()}
          </p>
        </div>

        <div className="page-header-actions">
          <button
            className="btn btn-secondary no-print"
            onClick={() => window.print()}
          >
            🖨 Print / Export PDF
          </button>

          {challan.status === "DRAFT" &&
            canAccess(
              user?.role,
              "challans",
              "confirm"
            ) && (
              <button
                className="btn btn-success no-print"
                onClick={handleConfirm}
                disabled={actionLoading}
              >
                {actionLoading
                  ? "Processing..."
                  : "✓ Confirm"}
              </button>
            )}

          {challan.status === "CONFIRMED" &&
            canAccess(
              user?.role,
              "challans",
              "cancel"
            ) && (
              <button
                className="btn btn-outline-danger no-print"
                onClick={handleCancel}
                disabled={actionLoading}
              >
                {actionLoading
                  ? "Processing..."
                  : "✕ Cancel"}
              </button>
            )}
        </div>
      </div>


      {error && (
        <div className="alert alert-error mb-4">
          {error}
        </div>
      )}


      {/* Challan Info */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="info-grid">
            <div className="info-item">
              <label>Challan Number</label>
              <span className="font-mono">
                {challan.challanNumber}
              </span>
            </div>

            <div className="info-item">
              <label>Status</label>
              <span
                className={`status-badge status-${String(
                  challan.status
                ).toLowerCase()}`}
              >
                {challan.status}
              </span>
            </div>

            <div className="info-item">
              <label>Customer</label>
              <span
                className="clickable-row"
                style={{
                  cursor: "pointer",
                  color: "var(--primary)",
                }}
                onClick={() =>
                  navigate(
                    `/customers/${challan.customer?.id}`
                  )
                }
              >
                {challan.customer?.customerName}
              </span>
            </div>

            <div className="info-item">
              <label>Business</label>
              <span>
                {challan.customer?.businessName || "-"}
              </span>
            </div>

            <div className="info-item">
              <label>Mobile</label>
              <span>
                {challan.customer?.mobile || "-"}
              </span>
            </div>

            <div className="info-item">
              <label>Email</label>
              <span>
                {challan.customer?.email || "-"}
              </span>
            </div>

            <div className="info-item">
              <label>Created By</label>
              <span>{challan.createdBy}</span>
            </div>

            <div className="info-item">
              <label>Total Quantity</label>
              <span>
                <strong>{challan.totalQuantity}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>


      {/* Items Table */}
      <div className="detail-section">
        <h3>
          Items ({challan.items?.length || 0})
        </h3>

        <div className="card">
          {(!challan.items ||
            challan.items.length === 0) ? (
            <div className="empty-state">
              No items in this challan.
            </div>
          ) : (
            <>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Unit Price</th>
                      <th>Quantity</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {challan.items.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <strong>
                            {item.productNameSnapshot}
                          </strong>
                        </td>
                        <td className="font-mono">
                          {item.skuSnapshot}
                        </td>
                        <td>
                          ₹
                          {item.unitPriceSnapshot.toFixed(
                            2
                          )}
                        </td>
                        <td>{item.quantity}</td>
                        <td>
                          <strong>
                            ₹{item.totalPrice.toFixed(2)}
                          </strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Grand Total */}
              <div className="card-body" style={{ borderTop: "1px solid var(--border)" }}>
                <div className="challan-summary">
                  <div>
                    <span className="summary-label">
                      Total Quantity
                    </span>
                    <strong style={{ marginLeft: 8 }}>
                      {challan.totalQuantity}
                    </strong>
                  </div>
                  <div>
                    <span className="summary-label">
                      Grand Total
                    </span>
                    <span className="summary-value">
                      ₹{totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Customer Address (if available) */}
      {challan.customer?.address && (
        <div className="detail-section">
          <h3>Delivery Address</h3>
          <div className="card">
            <div className="card-body">
              <p>{challan.customer.address}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};


export default ChallanDetail;
