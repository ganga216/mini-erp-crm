import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getNavItemsForRole } from "../utils/roleConfig";


// =====================================================
// DASHBOARD LAYOUT
// =====================================================

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = getNavItemsForRole(user?.role);

  // Derive page title from current path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "Dashboard";
    if (path.startsWith("/customers")) return "Customers";
    if (path.startsWith("/follow-ups")) return "Follow-ups";
    if (path.startsWith("/products")) return "Products";
    if (path.startsWith("/inventory")) return "Inventory";
    if (path.startsWith("/challans")) return "Challans";
    return "Mini ERP CRM";
  };


  return (
    <div className="app-layout">

      {/* ===============================================
          SIDEBAR OVERLAY (mobile)
          =============================================== */}

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}


      {/* ===============================================
          SIDEBAR
          =============================================== */}

      <aside
        className={`sidebar ${sidebarOpen ? "open" : ""}`}
      >

        <div className="sidebar-brand">
          <h2>Mini ERP CRM</h2>
          <span>Business Management</span>
        </div>


        <nav className="sidebar-nav">

          <div className="nav-section">
            <div className="nav-section-title">
              Menu
            </div>

            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `nav-item${isActive ? " active" : ""}`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <span className="nav-icon">
                  {item.icon}
                </span>
                {item.label}
              </NavLink>
            ))}
          </div>

        </nav>


        <div className="sidebar-footer">
          <div className="user-info">
            <strong>{user?.name}</strong>
            <span>{user?.role} • {user?.email}</span>
          </div>

          <button
            className="logout-button"
            onClick={logout}
          >
            Sign Out
          </button>
        </div>

      </aside>


      {/* ===============================================
          MAIN CONTENT
          =============================================== */}

      <div className="main-content">

        <header className="topbar">
          <div className="flex items-center gap-2">
            <button
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
            >
              ☰
            </button>

            <h1>{getPageTitle()}</h1>
          </div>

          <div className="topbar-user">
            <span>{user?.name}</span>
            <span className="role-badge">
              {user?.role}
            </span>
          </div>
        </header>


        <main className="page-content">
          <Outlet />
        </main>

      </div>

    </div>
  );
};


export default DashboardLayout;
