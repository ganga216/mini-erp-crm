import api from "./axios";


// =====================================================
// GET ALL PRODUCTS
// =====================================================

export const getProducts = async () => {
  const response = await api.get("/products");
  return response.data;
};


// =====================================================
// GET PRODUCT BY ID
// =====================================================

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};


// =====================================================
// GET LOW-STOCK PRODUCTS
// =====================================================

export const getLowStockProducts = async () => {
  const response = await api.get("/products/low-stock");
  return response.data;
};


// =====================================================
// CREATE PRODUCT
// =====================================================

export const createProduct = async (data) => {
  const response = await api.post("/products", data);
  return response.data;
};


// =====================================================
// UPDATE PRODUCT
// =====================================================

export const updateProduct = async (id, data) => {
  const response = await api.put(`/products/${id}`, data);
  return response.data;
};
