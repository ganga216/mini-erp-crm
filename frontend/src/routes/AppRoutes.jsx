import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import CustomerList from "../pages/CustomerList";
import CustomerDetail from "../pages/CustomerDetail";
import CustomerForm from "../pages/CustomerForm";
import FollowUpList from "../pages/FollowUpList";
import ProductList from "../pages/ProductList";
import ProductForm from "../pages/ProductForm";
import Inventory from "../pages/Inventory";
import ChallanList from "../pages/ChallanList";
import ChallanCreate from "../pages/ChallanCreate";
import ChallanDetail from "../pages/ChallanDetail";

import ProtectedRoute from "../components/ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";


// =====================================================
// APPLICATION ROUTES
// =====================================================

const AppRoutes = () => {
  return (
    <Routes>

      {/* =================================================
          PUBLIC
          ================================================= */}

      <Route
        path="/login"
        element={<Login />}
      />


      {/* =================================================
          PROTECTED
          ================================================= */}

      <Route element={<ProtectedRoute />}>

        <Route element={<DashboardLayout />}>

          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          {/* Customers */}
          <Route
            path="/customers"
            element={<CustomerList />}
          />

          <Route
            path="/customers/new"
            element={<CustomerForm />}
          />

          <Route
            path="/customers/:id"
            element={<CustomerDetail />}
          />

          <Route
            path="/customers/:id/edit"
            element={<CustomerForm />}
          />

          {/* Follow-ups */}
          <Route
            path="/follow-ups"
            element={<FollowUpList />}
          />

          {/* Products */}
          <Route
            path="/products"
            element={<ProductList />}
          />

          <Route
            path="/products/new"
            element={<ProductForm />}
          />

          <Route
            path="/products/:id/edit"
            element={<ProductForm />}
          />

          {/* Inventory */}
          <Route
            path="/inventory"
            element={<Inventory />}
          />

          {/* Challans */}
          <Route
            path="/challans"
            element={<ChallanList />}
          />

          <Route
            path="/challans/new"
            element={<ChallanCreate />}
          />

          <Route
            path="/challans/:id"
            element={<ChallanDetail />}
          />

        </Route>

      </Route>


      {/* =================================================
          DEFAULT
          ================================================= */}

      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />


      {/* =================================================
          UNKNOWN
          ================================================= */}

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

    </Routes>
  );
};


export default AppRoutes;