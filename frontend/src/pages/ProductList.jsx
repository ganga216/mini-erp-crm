import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getProducts } from "../api/product.api";
import { canAccess } from "../utils/roleConfig";


// =====================================================
// PRODUCT LIST
// =====================================================

const ProductList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("");


  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getProducts();
        if (data.success) {
          setProducts(data.products);
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Failed to load products"
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);


  const filtered = products.filter((p) => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(search.toLowerCase()));

    const isLowStock = p.currentStock <= p.minimumStock;

    const matchesStock =
      !stockFilter ||
      (stockFilter === "LOW" && isLowStock) ||
      (stockFilter === "OK" && !isLowStock);

    return matchesSearch && matchesStock;
  });


  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner" />
        Loading products...
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
          <h2>Products</h2>
          <p>{products.length} total products</p>
        </div>

        <div className="page-header-actions">
          {canAccess(user?.role, "products", "create") && (
            <button
              className="btn btn-primary"
              onClick={() => navigate("/products/new")}
            >
              + Add Product
            </button>
          )}
        </div>
      </div>


      <div className="search-bar">
        <input
          className="search-input"
          type="text"
          placeholder="Search by name, SKU, category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="filter-select"
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
        >
          <option value="">All Stock</option>
          <option value="LOW">Low Stock</option>
          <option value="OK">In Stock</option>
        </select>
      </div>


      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state">
            No products found.
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Unit Price</th>
                  <th>Stock</th>
                  <th>Min Stock</th>
                  <th>Location</th>
                  {canAccess(user?.role, "products", "create") && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
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
                      <td>{p.category || "-"}</td>
                      <td>₹{p.unitPrice.toFixed(2)}</td>
                      <td>
                        {isLow ? (
                          <span className="low-stock-badge">
                            ⚠ {p.currentStock}
                          </span>
                        ) : (
                          <span className="stock-ok">
                            {p.currentStock}
                          </span>
                        )}
                      </td>
                      <td>{p.minimumStock}</td>
                      <td>
                        {p.warehouseLocation || "-"}
                      </td>
                      {canAccess(user?.role, "products", "create") && (
                        <td>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => navigate(`/products/${p.id}/edit`)}
                          >
                            ✎ Edit
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};


export default ProductList;
