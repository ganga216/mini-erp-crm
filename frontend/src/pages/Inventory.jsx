import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getProducts } from "../api/product.api";
import {
  getAllStockMovements,
  createStockMovement,
} from "../api/stock.api";
import { canAccess } from "../utils/roleConfig";


// =====================================================
// INVENTORY
// =====================================================

const Inventory = () => {
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add movement form
  const [showForm, setShowForm] = useState(false);
  const [formProductId, setFormProductId] = useState("");
  const [formQuantity, setFormQuantity] = useState("");
  const [formType, setFormType] = useState("IN");
  const [formReason, setFormReason] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);


  // ---------------------------------------------------
  // Load data
  // ---------------------------------------------------

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [pData, mData] = await Promise.all([
        getProducts(),
        getAllStockMovements(),
      ]);

      if (pData.success) setProducts(pData.products);
      if (mData.success) setMovements(mData.movements);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to load inventory"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);


  // ---------------------------------------------------
  // Submit movement
  // ---------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    try {
      const data = await createStockMovement(
        Number(formProductId),
        {
          quantity: Number(formQuantity),
          movementType: formType,
          reason: formReason,
        }
      );

      if (data.success) {
        setShowForm(false);
        setFormProductId("");
        setFormQuantity("");
        setFormType("IN");
        setFormReason("");
        loadData();
      }
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
        "Failed to create stock movement"
      );
    } finally {
      setSubmitting(false);
    }
  };


  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner" />
        Loading inventory...
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
          <h2>Inventory</h2>
          <p>
            Stock levels and movement history
          </p>
        </div>

        <div className="page-header-actions">
          {canAccess(user?.role, "stock", "create") && (
            <button
              className="btn btn-primary"
              onClick={() => setShowForm(!showForm)}
            >
              + Add Movement
            </button>
          )}
        </div>
      </div>


      {/* Add Movement Form */}
      {showForm && (
        <div className="card mb-6">
          <div className="card-header">
            <h3>New Stock Movement</h3>
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
                    Product
                    <span className="required">*</span>
                  </label>
                  <select
                    value={formProductId}
                    onChange={(e) =>
                      setFormProductId(e.target.value)
                    }
                    required
                  >
                    <option value="">
                      Select product...
                    </option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku}) — Stock:{" "}
                        {p.currentStock}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Type
                    <span className="required">*</span>
                  </label>
                  <select
                    value={formType}
                    onChange={(e) =>
                      setFormType(e.target.value)
                    }
                  >
                    <option value="IN">
                      Stock IN
                    </option>
                    <option value="OUT">
                      Stock OUT
                    </option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Quantity
                    <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formQuantity}
                    onChange={(e) =>
                      setFormQuantity(e.target.value)
                    }
                    placeholder="Enter quantity"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Reason
                    <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={formReason}
                    onChange={(e) =>
                      setFormReason(e.target.value)
                    }
                    placeholder="e.g. Purchase order, Return..."
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting
                    ? "Processing..."
                    : "Record Movement"}
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


      {/* Stock Levels Table */}
      <div className="detail-section">
        <h3>Current Stock Levels</h3>

        <div className="card">
          {products.length === 0 ? (
            <div className="empty-state">
              No products in inventory.
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Current Stock</th>
                    <th>Min Stock</th>
                    <th>Status</th>
                    <th>Location</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const isLow =
                      p.currentStock <= p.minimumStock;

                    return (
                      <tr key={p.id}>
                        <td>
                          <strong>{p.name}</strong>
                        </td>
                        <td>
                          <span className="font-mono">
                            {p.sku}
                          </span>
                        </td>
                        <td>
                          <strong
                            className={
                              isLow
                                ? "stock-danger"
                                : "stock-ok"
                            }
                          >
                            {p.currentStock}
                          </strong>
                        </td>
                        <td>{p.minimumStock}</td>
                        <td>
                          {isLow ? (
                            <span className="low-stock-badge">
                              ⚠ Low Stock
                            </span>
                          ) : (
                            <span className="status-badge status-active">
                              OK
                            </span>
                          )}
                        </td>
                        <td>
                          {p.warehouseLocation || "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>


      {/* Movement History */}
      <div className="detail-section">
        <h3>
          Movement History ({movements.length})
        </h3>

        <div className="card">
          {movements.length === 0 ? (
            <div className="empty-state">
              No stock movements recorded.
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Reason</th>
                    <th>By</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <strong>
                          {m.product?.name}
                        </strong>
                        <small>
                          {m.product?.sku}
                        </small>
                      </td>
                      <td>
                        <span
                          className={
                            m.movementType === "IN"
                              ? "movement-in"
                              : "movement-out"
                          }
                        >
                          {m.movementType === "IN"
                            ? "▲ IN"
                            : "▼ OUT"}
                        </span>
                      </td>
                      <td>{m.quantity}</td>
                      <td>{m.reason}</td>
                      <td>{m.createdBy}</td>
                      <td>
                        {new Date(
                          m.createdAt
                        ).toLocaleString()}
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


export default Inventory;
