import api from "./axios";


// =====================================================
// GET ALL STOCK MOVEMENTS
// =====================================================

export const getAllStockMovements = async () => {
  const response = await api.get("/products/stock/movements");
  return response.data;
};


// =====================================================
// GET STOCK MOVEMENTS FOR PRODUCT
// =====================================================

export const getStockMovements = async (productId) => {
  const response = await api.get(
    `/products/${productId}/stock`
  );
  return response.data;
};


// =====================================================
// CREATE STOCK MOVEMENT
// =====================================================

export const createStockMovement = async (productId, data) => {
  const response = await api.post(
    `/products/${productId}/stock`,
    data
  );
  return response.data;
};
