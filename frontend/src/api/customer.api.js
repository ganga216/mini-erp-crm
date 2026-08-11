import api from "./axios";


// =====================================================
// GET ALL CUSTOMERS
// =====================================================

export const getCustomers = async () => {
  const response = await api.get("/customers");
  return response.data;
};


// =====================================================
// GET CUSTOMER BY ID
// =====================================================

export const getCustomerById = async (id) => {
  const response = await api.get(`/customers/${id}`);
  return response.data;
};


// =====================================================
// CREATE CUSTOMER
// =====================================================

export const createCustomer = async (data) => {
  const response = await api.post("/customers", data);
  return response.data;
};


// =====================================================
// UPDATE CUSTOMER
// =====================================================

export const updateCustomer = async (id, data) => {
  const response = await api.put(`/customers/${id}`, data);
  return response.data;
};
