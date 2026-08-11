import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getChallans } from "../api/challan.api";
import { canAccess } from "../utils/roleConfig";


// =====================================================
// CHALLAN LIST
// =====================================================

const ChallanList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");


  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getChallans();

        if (data.success) {
          setChallans(data.challans);
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Failed to load challans"
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);


  const filtered = challans.filter((c) =>
    !statusFilter || c.status === statusFilter
  );


  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner" />
        Loading challans...
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
          <h2>Challans</h2>
          <p>{challans.length} total challans</p>
        </div>

        <div className="page-header-actions">
          {canAccess(user?.role, "challans", "create") && (
            <button
              className="btn btn-primary"
              onClick={() => navigate("/challans/new")}
            >
              + Create Challan
            </button>
          )}
        </div>
      </div>


      <div className="search-bar">
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>


      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state">
            No challans found.
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Challan #</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total Qty</th>
                  <th>Status</th>
                  <th>Created By</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="clickable-row"
                    onClick={() =>
                      navigate(`/challans/${c.id}`)
                    }
                  >
                    <td>
                      <strong className="font-mono">
                        {c.challanNumber}
                      </strong>
                    </td>
                    <td>
                      <strong>
                        {c.customer?.customerName}
                      </strong>
                      {c.customer?.businessName && (
                        <small>
                          {c.customer.businessName}
                        </small>
                      )}
                    </td>
                    <td>{c.items?.length || 0}</td>
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
                    <td>{c.createdBy}</td>
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
  );
};


export default ChallanList;
