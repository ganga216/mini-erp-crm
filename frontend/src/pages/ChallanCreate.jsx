import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getCustomers } from "../api/customer.api";
import { getProducts } from "../api/product.api";
import {
  createChallan,
  addChallanItem,
  confirmChallan,
} from "../api/challan.api";


// =====================================================
// CHALLAN CREATE
// =====================================================

const ChallanCreate = () => {
  const navigate = useNavigate();

  // Data
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Steps
  const [step, setStep] = useState(1); // 1=select customer, 2=add items, 3=confirm
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [challan, setChallan] = useState(null);
  const [addedItems, setAddedItems] = useState([]);

  // Item form
  const [itemProductId, setItemProductId] = useState("");
  const [itemQuantity, setItemQuantity] = useState("");

  // State
  const [error, setError] = useState("");
  const [itemError, setItemError] = useState("");
  const [submitting, setSubmitting] = useState(false);


  // ---------------------------------------------------
  // Load customers + products
  // ---------------------------------------------------

  useEffect(() => {
    const load = async () => {
      try {
        const [cData, pData] = await Promise.all([
          getCustomers(),
          getProducts(),
        ]);

        if (cData.success) setCustomers(cData.customers);
        if (pData.success) setProducts(pData.products);
      } catch (err) {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);


  // ---------------------------------------------------
  // Step 1: Create draft challan
  // ---------------------------------------------------

  const handleCreateDraft = async () => {
    if (!selectedCustomerId) return;

    setError("");
    setSubmitting(true);

    try {
      const data = await createChallan({
        customerId: Number(selectedCustomerId),
      });

      if (data.success) {
        setChallan(data.challan);
        setStep(2);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to create challan"
      );
    } finally {
      setSubmitting(false);
    }
  };


  // ---------------------------------------------------
  // Step 2: Add item
  // ---------------------------------------------------

  const handleAddItem = async (e) => {
    e.preventDefault();
    setItemError("");

    if (!itemProductId || !itemQuantity) return;

    // Check if product already added
    if (
      addedItems.some(
        (i) => i.productId === Number(itemProductId)
      )
    ) {
      setItemError("Product already added to this challan");
      return;
    }

    setSubmitting(true);

    try {
      const data = await addChallanItem(challan.id, {
        productId: Number(itemProductId),
        quantity: Number(itemQuantity),
      });

      if (data.success) {
        const product = products.find(
          (p) => p.id === Number(itemProductId)
        );

        setAddedItems([
          ...addedItems,
          {
            ...data.item,
            productName: product?.name || "Unknown",
            productSku: product?.sku || "",
          },
        ]);

        setChallan(data.challan);
        setItemProductId("");
        setItemQuantity("");
      }
    } catch (err) {
      setItemError(
        err.response?.data?.message ||
        "Failed to add item"
      );
    } finally {
      setSubmitting(false);
    }
  };


  // ---------------------------------------------------
  // Step 3: Confirm
  // ---------------------------------------------------

  const handleConfirm = async () => {
    setError("");
    setSubmitting(true);

    try {
      const data = await confirmChallan(challan.id);

      if (data.success) {
        navigate(`/challans/${challan.id}`);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to confirm challan"
      );
    } finally {
      setSubmitting(false);
    }
  };


  // ---------------------------------------------------
  // Calculate totals
  // ---------------------------------------------------

  const totalQuantity = addedItems.reduce(
    (sum, i) => sum + i.quantity,
    0
  );

  const totalPrice = addedItems.reduce(
    (sum, i) => sum + i.totalPrice,
    0
  );


  // ---------------------------------------------------
  // Loading
  // ---------------------------------------------------

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner" />
        Loading...
      </div>
    );
  }


  return (
    <div>
      <Link to="/challans" className="back-link">
        ← Back to Challans
      </Link>

      <div className="page-header">
        <div>
          <h2>Create Challan</h2>
          <p>
            {step === 1 && "Step 1: Select a customer"}
            {step === 2 && "Step 2: Add products to the challan"}
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error mb-4">
          {error}
        </div>
      )}


      {/* ===============================================
          STEP 1: Select Customer
          =============================================== */}

      {step === 1 && (
        <div className="card">
          <div className="card-header">
            <h3>Select Customer</h3>
            <p>Choose the customer for this challan</p>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label>
                Customer
                <span className="required">*</span>
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) =>
                  setSelectedCustomerId(e.target.value)
                }
              >
                <option value="">
                  Select customer...
                </option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.customerName}
                    {c.businessName
                      ? ` — ${c.businessName}`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-actions">
              <button
                className="btn btn-primary"
                onClick={handleCreateDraft}
                disabled={
                  !selectedCustomerId || submitting
                }
              >
                {submitting
                  ? "Creating..."
                  : "Create Draft Challan"}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ===============================================
          STEP 2: Add Items
          =============================================== */}

      {step === 2 && challan && (
        <div className="challan-builder">

          {/* Challan Info */}
          <div className="card">
            <div className="card-body">
              <div className="info-grid">
                <div className="info-item">
                  <label>Challan #</label>
                  <span className="font-mono">
                    {challan.challanNumber}
                  </span>
                </div>
                <div className="info-item">
                  <label>Customer</label>
                  <span>
                    {challan.customer?.customerName}
                  </span>
                </div>
                <div className="info-item">
                  <label>Status</label>
                  <span className="status-badge status-draft">
                    DRAFT
                  </span>
                </div>
              </div>
            </div>
          </div>


          {/* Add Item Form */}
          <div className="card">
            <div className="card-header">
              <h3>Add Product</h3>
            </div>
            <div className="card-body">
              {itemError && (
                <div className="alert alert-error">
                  {itemError}
                </div>
              )}

              <form onSubmit={handleAddItem}>
                <div className="form-row">
                  <div className="form-group">
                    <label>
                      Product
                      <span className="required">*</span>
                    </label>
                    <select
                      value={itemProductId}
                      onChange={(e) =>
                        setItemProductId(e.target.value)
                      }
                      required
                    >
                      <option value="">
                        Select product...
                      </option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku}) — ₹
                          {p.unitPrice} — Stock:{" "}
                          {p.currentStock}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      Quantity
                      <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={itemQuantity}
                      onChange={(e) =>
                        setItemQuantity(e.target.value)
                      }
                      placeholder="Enter quantity"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-secondary"
                  disabled={submitting}
                >
                  {submitting
                    ? "Adding..."
                    : "+ Add to Challan"}
                </button>
              </form>
            </div>
          </div>


          {/* Added Items Table */}
          {addedItems.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3>
                  Challan Items ({addedItems.length})
                </h3>
              </div>

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
                    {addedItems.map((item) => (
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

              {/* Summary */}
              <div
                className="card-body"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <div className="challan-summary">
                  <div>
                    <span className="summary-label">
                      Total Quantity:
                    </span>
                    <strong style={{ marginLeft: 8 }}>
                      {totalQuantity}
                    </strong>
                  </div>
                  <div>
                    <span className="summary-label">
                      Grand Total:
                    </span>
                    <span className="summary-value">
                      ₹{totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div
                  className="form-actions"
                  style={{ borderTop: "none" }}
                >
                  <button
                    className="btn btn-success btn-lg"
                    onClick={handleConfirm}
                    disabled={submitting}
                  >
                    {submitting
                      ? "Confirming..."
                      : "✓ Confirm Challan"}
                  </button>

                  <button
                    className="btn btn-secondary"
                    onClick={() =>
                      navigate(`/challans/${challan.id}`)
                    }
                  >
                    Save as Draft
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};


export default ChallanCreate;
