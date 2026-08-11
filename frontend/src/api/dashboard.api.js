import api from "./axios";


// =====================================================
// DASHBOARD SUMMARY
// =====================================================

export const getDashboardSummary = async () => {
  const response = await api.get("/dashboard/summary");
  return response.data;
};


// =====================================================
// DASHBOARD DETAILS
// =====================================================

export const getDashboardDetails = async () => {
  const response = await api.get("/dashboard/details");
  return response.data;
};
