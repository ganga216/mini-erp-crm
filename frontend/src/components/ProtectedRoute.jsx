import {
  Navigate,
  Outlet,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";


// =====================================================
// PROTECTED ROUTE
// =====================================================

const ProtectedRoute = () => {
  const {
    isAuthenticated,
    loading,
  } = useAuth();


  // ---------------------------------------------------
  // Wait for authentication restoration
  // ---------------------------------------------------

  if (loading) {
    return (
      <div>
        Loading...
      </div>
    );
  }


  // ---------------------------------------------------
  // Redirect unauthenticated users
  // ---------------------------------------------------

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }


  // ---------------------------------------------------
  // Authorized
  // ---------------------------------------------------

  return <Outlet />;
};


export default ProtectedRoute;