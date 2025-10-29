// src/layouts/LoadCommitteeLayout.jsx
import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../Hooks/AuthContext";

function SideLink({ to, label, icon, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
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

export default function LoadCommitteeLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const email = user?.email || "";


  const handleLogout = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      logout();
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row flex-nowrap min-vh-100">
        {/* Sidebar (desktop lg+) */}
        <aside className="col-lg-2 d-none d-lg-flex bg-info text-white p-3 flex-column">
          <div className="d-flex align-items-center gap-2 mb-3">
            <span className="h3 mb-0">SmartSchedule</span>
          </div>

          <nav>
            <ul className="nav nav-pills flex-column mb-auto gap-1">
              <li>
                <SideLink
                  to="/load_committee"
                  label="Dashboard"
                  end={true}
                  icon={
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="currentColor"
                    >
                      <path d="M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z" />
                    </svg>
                  }
                />
              </li>
              <li>
                <SideLink
                  to="/load_committee/courses"
                  label="Courses"
                  icon={
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="currentColor"
                    >
                      <path d="M4 3h12a3 3 0 0 1 3 3v14h-2V6a1 1 0 0 0-1-1H4z" />
                      <path d="M4 5h10a2 2 0 0 1 2 2v13H6a2 2 0 0 1-2-2z" />
                    </svg>
                  }
                />
              </li>
              <li>
                <SideLink
                  to="/load_committee/feedback"
                  label="Feedback"
                  icon={
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="currentColor"
                    >
                      <path d="M4 4h16v11H7l-3 3z" />
                    </svg>
                  }
                />
              </li>
            </ul>
          </nav>

          {/* Logout in sidebar */}
          <div className="mt-auto">
            <button
              className="btn btn-outline-light w-100"
              onClick={handleLogout}
              disabled={loading}
            >
              {loading && (
                <span className="spinner-border spinner-border-sm me-2"></span>
              )}
              {loading ? "Logging out..." : "Logout"}
            </button>
          </div>
        </aside>

        {/* Offcanvas sidebar (mobile/tablet) */}
        <div
          className="offcanvas offcanvas-start text-white bg-info"
          tabIndex={-1}
          id="loadCommitteeOffcanvas"
          aria-labelledby="loadCommitteeOffcanvasLabel"
        >
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="loadCommitteeOffcanvasLabel">
              SmartSchedule
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            ></button>
          </div>
          <div className="offcanvas-body">
            <ul className="nav nav-pills flex-column mb-auto gap-1">
              <li data-bs-dismiss="offcanvas">
                <SideLink
                  to="/load_committee"
                  label="Dashboard"
                  end={true}
                  icon={
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="currentColor"
                    >
                      <path d="M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z" />
                    </svg>
                  }
                />
              </li>
              <li data-bs-dismiss="offcanvas">
                <SideLink
                  to="/load_committee/courses"
                  label="Courses"
                  icon={
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="currentColor"
                    >
                      <path d="M4 3h12a3 3 0 0 1 3 3v14h-2V6a1 1 0 0 0-1-1H4z" />
                      <path d="M4 5h10a2 2 0 0 1 2 2v13H6a2 2 0 0 1-2-2z" />
                    </svg>
                  }
                />
              </li>
              <li data-bs-dismiss="offcanvas">
                <SideLink
                  to="/load_committee/feedback"
                  label="Feedback"
                  icon={
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="currentColor"
                    >
                      <path d="M4 4h16v11H7l-3 3z" />
                    </svg>
                  }
                />
              </li>
            </ul>

            {/* Logout inside offcanvas */}
            <button
              type="button"
              className="btn btn-outline-light w-100 mt-3"
              onClick={handleLogout}
              disabled={loading}
              data-bs-dismiss="offcanvas"
            >
              {loading && (
                <span className="spinner-border spinner-border-sm me-2"></span>
              )}
              {loading ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>

        {/* Main column */}
        <div className="col px-0 d-flex flex-column">
          {/* Top navbar */}
          <nav className="navbar navbar-light bg-light px-3 shadow-sm sticky-top">
            {/* Hamburger (mobile only) */}
            <button
              type="button"
              className="p-0 border-0 bg-transparent d-lg-none me-2 text-info d-inline-flex align-items-center justify-content-center"
              style={{ width: 40, height: 40 }}
              data-bs-toggle="offcanvas"
              data-bs-target="#loadCommitteeOffcanvas"
              aria-controls="loadCommitteeOffcanvas"
              aria-label="Open menu"
            >
              <svg
                viewBox="0 0 24 24"
                width="26"
                height="26"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z" />
              </svg>
            </button>

            {/* Brand */}
            <span className="navbar-brand mb-0 h4">Load Committee Dashboard</span>

            {/* User info */}
            <div className="ms-auto text-end">
              {/* <div
                className="text-primary fw-semibold text-truncate"
                style={{ maxWidth: 260 }}
              >
                {userName}
              </div> */}
              <small
                className="text-muted d-block text-truncate"
                style={{ maxWidth: 260 }}
              >
                {email}
              </small>
            </div>
          </nav>

          {/* Content */}
          <main className="p-3 p-md-4 bg-light flex-grow-1">
            <Outlet />
          </main>

          {/* Footer */}
          <footer className="bg-white border-top text-muted small py-2 px-3 text-center">
            © {new Date().getFullYear()} SmartSchedule
          </footer>
        </div>
      </div>
    </div>
  );
}