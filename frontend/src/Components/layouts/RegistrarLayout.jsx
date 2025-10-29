// src/layouts/RegistrarLayout.jsx
import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../Hooks/AuthContext";

function SideLink({ to, label, icon }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        "nav-link d-flex align-items-center gap-2 position-relative rounded-3 px-3 py-2 " +
        (isActive ? "bg-white text-info fw-semibold" : "text-white")
      }
    >
      <span
        aria-hidden="true"
        style={{ display: "inline-grid", placeItems: "center" }}
      >
        {icon}
      </span>
      <span className="text-truncate">{label}</span>
    </NavLink>
  );
}

export default function RegistrarLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getNavbarTitle = () => {
    return "Registrar Dashboard";
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="container-fluid">
      <div className="row flex-nowrap min-vh-100">
        {/* Sidebar */}
        <aside className="col-lg-2 d-none d-lg-flex bg-info text-white p-3 flex-column">
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="h3 mb-0">SmartSchedule</span>
          </div>

          <nav>
            <ul className="nav nav-pills flex-column mb-auto gap-1">
              {/* 👩‍💼 Registrar Menu */}
              <li>
                <SideLink
                  to="/registrar"
                  label="Dashboard"
                  icon={
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z" />
                    </svg>
                  }
                />
              </li>

              {/* 🧮 Course Capacity */}
              <li>
                <SideLink
                  to="/registrar/course-capacity"
                  label="Course Capacity"
                  icon={
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M4 3h16a1 1 0 0 1 1 1v16l-9-4-9 4V4a1 1 0 0 1 1-1z" />
                    </svg>
                  }
                />
              </li>
            </ul>
          </nav>

          {/* Logout */}
          <div className="mt-auto">
            <button
              type="button"
              className="btn btn-outline-light w-100"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </aside>

        {/* ====== Main Layout Area ====== */}
        <div className="col px-0 d-flex flex-column">
          <nav className="navbar navbar-light bg-light px-3 shadow-sm sticky-top">
            <span className="navbar-brand mb-0 h4">{getNavbarTitle()}</span>
            <div className="ms-auto">
              <span
                className="d-inline-block text-primary fw-semibold text-truncate"
                style={{ maxWidth: 260 }}
                title={user?.email}
              >
                {user?.email || ""}
              </span>
            </div>
          </nav>

          <main className="p-3 p-md-4 bg-light flex-grow-1">
            <Outlet />
          </main>

          <footer className="bg-white border-top text-muted small py-2 px-3 text-center">
            © {new Date().getFullYear()} SmartSchedule
          </footer>
        </div>
      </div>
    </div>
  );
}
