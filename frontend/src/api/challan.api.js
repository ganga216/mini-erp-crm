import api from "./axios";


// =====================================================
// GET ALL CHALLANS
// =====================================================

export const getChallans = async () => {
  const response = await api.get("/challans");
  return response.data;
};


// =====================================================
// GET CHALLAN BY ID
// =====================================================

export const getChallanById = async (id) => {
  const response = await api.get(`/challans/${id}`);
  return response.data;
};


// =====================================================
// CREATE DRAFT CHALLAN
// =====================================================

export const createChallan = async (data) => {
  const response = await api.post("/challans", data);
  return response.data;
};


// =====================================================
// ADD ITEM TO CHALLAN
// =====================================================

export const addChallanItem = async (challanId, data) => {
  const response = await api.post(
    `/challans/${challanId}/items`,
    data
  );
  return response.data;
};


// =====================================================
// CONFIRM CHALLAN
// =====================================================

export const confirmChallan = async (id) => {
  const response = await api.post(
    `/challans/${id}/confirm`
  );
  return response.data;
};


// =====================================================
// CANCEL CHALLAN
// =====================================================

export const cancelChallan = async (id) => {
  const response = await api.post(
    `/challans/${id}/cancel`
  );
  return response.data;
};
