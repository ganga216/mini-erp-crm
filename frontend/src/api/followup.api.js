import api from "./axios";


// =====================================================
// GET ALL FOLLOW-UPS
// =====================================================

export const getFollowUps = async () => {
  const response = await api.get("/followups");
  return response.data;
};


// =====================================================
// GET FOLLOW-UP BY ID
// =====================================================

export const getFollowUpById = async (id) => {
  const response = await api.get(`/followups/${id}`);
  return response.data;
};


// =====================================================
// CREATE FOLLOW-UP
// =====================================================

export const createFollowUp = async (data) => {
  const response = await api.post("/followups", data);
  return response.data;
};
