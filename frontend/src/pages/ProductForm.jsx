import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { createProduct, updateProduct, getProductById } from "../api/product.api";


// =====================================================
// PRODUCT FORM (Create / Edit)
// =====================================================

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "",
    unitPrice: "",
    currentStock: "0",
    minimumStock: "0",
    warehouseLocation: "",
  });

  useEffect(() => {
    if (!isEdit) return;

    const load = async () => {
      try {
        const data = await getProductById(id);
        if (data.success && data.product) {
          const p = data.product;
          setForm({
            name: p.name || "",
            sku: p.sku || "",
            category: p.category || "",
            unitPrice: p.unitPrice !== undefined ? String(p.unitPrice) : "",
            currentStock: p.currentStock !== undefined ? String(p.currentStock) : "0",
            minimumStock: p.minimumStock !== undefined ? String(p.minimumStock) : "0",
            warehouseLocation: p.warehouseLocation || "",
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, isEdit]);


  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const payload = {
        name: form.name,
        sku: form.sku,
        category: form.category || null,
        unitPrice: Number(form.unitPrice),
        minimumStock: Number(form.minimumStock),
        warehouseLocation: form.warehouseLocation || null,
      };

      if (!isEdit) {
        payload.currentStock = Number(form.currentStock);
      }

      if (isEdit) {
        const data = await updateProduct(id, payload);
        if (data.success) navigate("/products");
      } else {
        const data = await createProduct(payload);
        if (data.success) navigate("/products");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        `Failed to ${isEdit ? "update" : "create"} product`
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner" />
        Loading product...
      </div>
    );
  }


  return (
    <div>
      <Link to="/products" className="back-link">
        ← Back to Products
      </Link>

      <div className="page-header">
        <div>
          <h2>{isEdit ? "Edit Product" : "Add Product"}</h2>
          <p>{isEdit ? "Update product catalog details" : "Create a new product in the catalog"}</p>
        </div>
      </div>


      <div className="card">
        <div className="card-body">

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="form-row">
              <div className="form-group">
                <label>
                  Product Name
                  <span className="required">*</span>
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  SKU
                  <span className="required">*</span>
                </label>
                <input
                  name="sku"
                  value={form.sku}
                  onChange={handleChange}
                  placeholder="e.g. PRD-001"
                  required
                />
              </div>
            </div>


            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <input
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="e.g. Electronics"
                />
              </div>

              <div className="form-group">
                <label>
                  Unit Price (₹)
                  <span className="required">*</span>
                </label>
                <input
                  name="unitPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.unitPrice}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>


            <div className="form-row">
              {!isEdit && (
                <div className="form-group">
                  <label>Current Stock</label>
                  <input
                    name="currentStock"
                    type="number"
                    min="0"
                    value={form.currentStock}
                    onChange={handleChange}
                  />
                </div>
              )}

              <div className="form-group">
                <label>Minimum Stock Alert</label>
                <input
                  name="minimumStock"
                  type="number"
                  min="0"
                  value={form.minimumStock}
                  onChange={handleChange}
                />
                <span className="form-hint">
                  Alert when stock falls to or below this
                </span>
              </div>
            </div>


            <div className="form-group">
              <label>Warehouse Location</label>
              <input
                name="warehouseLocation"
                value={form.warehouseLocation}
                onChange={handleChange}
                placeholder="e.g. Rack A-3"
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
                  : isEdit
                  ? "Update Product"
                  : "Create Product"}
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/products")}
              >
                Cancel
              </button>
            </div>

          </form>
        </div>
      </div>

    </div>
  );
};


export default ProductForm;
