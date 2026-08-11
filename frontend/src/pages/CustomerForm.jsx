import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import {
  createCustomer,
  updateCustomer,
  getCustomerById,
} from "../api/customer.api";


// =====================================================
// CUSTOMER FORM (Create / Edit)
// =====================================================

const CustomerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    customerName: "",
    mobile: "",
    email: "",
    businessName: "",
    gstNumber: "",
    customerType: "RETAIL",
    address: "",
    status: "LEAD",
    followUpDate: "",
    notes: "",
  });


  // ---------------------------------------------------
  // Load existing customer for edit
  // ---------------------------------------------------

  useEffect(() => {
    if (!isEdit) return;

    const load = async () => {
      try {
        const data = await getCustomerById(id);

        if (data.success && data.customer) {
          const c = data.customer;

          setForm({
            customerName: c.customerName || "",
            mobile: c.mobile || "",
            email: c.email || "",
            businessName: c.businessName || "",
            gstNumber: c.gstNumber || "",
            customerType: c.customerType || "RETAIL",
            address: c.address || "",
            status: c.status || "LEAD",
            followUpDate: c.followUpDate
              ? c.followUpDate.slice(0, 16)
              : "",
            notes: c.notes || "",
          });
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

    load();
  }, [id, isEdit]);


  // ---------------------------------------------------
  // Handle change
  // ---------------------------------------------------

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };


  // ---------------------------------------------------
  // Submit
  // ---------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const payload = {
        ...form,
        followUpDate: form.followUpDate || null,
      };

      if (isEdit) {
        const data = await updateCustomer(id, payload);

        if (data.success) {
          navigate(`/customers/${id}`);
        }
      } else {
        const data = await createCustomer(payload);

        if (data.success) {
          navigate("/customers");
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        `Failed to ${isEdit ? "update" : "create"} customer`
      );
    } finally {
      setSubmitting(false);
    }
  };


  // ---------------------------------------------------
  // Loading
  // ---------------------------------------------------

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner" />
        Loading customer...
      </div>
    );
  }


  return (
    <div>
      <Link to="/customers" className="back-link">
        ← Back to Customers
      </Link>

      <div className="page-header">
        <div>
          <h2>
            {isEdit ? "Edit Customer" : "Add Customer"}
          </h2>
          <p>
            {isEdit
              ? "Update customer information"
              : "Create a new customer record"}
          </p>
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
                  Customer Name
                  <span className="required">*</span>
                </label>
                <input
                  name="customerName"
                  value={form.customerName}
                  onChange={handleChange}
                  placeholder="Enter customer name"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Mobile
                  <span className="required">*</span>
                </label>
                <input
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  placeholder="Enter mobile number"
                  required
                />
              </div>
            </div>


            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                />
              </div>

              <div className="form-group">
                <label>Business Name</label>
                <input
                  name="businessName"
                  value={form.businessName}
                  onChange={handleChange}
                  placeholder="Enter business name"
                />
              </div>
            </div>


            <div className="form-row">
              <div className="form-group">
                <label>GST Number</label>
                <input
                  name="gstNumber"
                  value={form.gstNumber}
                  onChange={handleChange}
                  placeholder="Enter GST number"
                />
              </div>

              <div className="form-group">
                <label>Customer Type</label>
                <select
                  name="customerType"
                  value={form.customerType}
                  onChange={handleChange}
                >
                  <option value="RETAIL">Retail</option>
                  <option value="WHOLESALE">
                    Wholesale
                  </option>
                  <option value="DISTRIBUTOR">
                    Distributor
                  </option>
                </select>
              </div>
            </div>


            <div className="form-row">
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="LEAD">Lead</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">
                    Inactive
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label>Follow-up Date</label>
                <input
                  name="followUpDate"
                  type="datetime-local"
                  value={form.followUpDate}
                  onChange={handleChange}
                />
              </div>
            </div>


            <div className="form-group">
              <label>Address</label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Enter address"
                rows={2}
              />
            </div>


            <div className="form-group">
              <label>Notes</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Additional notes..."
                rows={3}
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
                  ? "Update Customer"
                  : "Create Customer"}
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/customers")}
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


export default CustomerForm;
