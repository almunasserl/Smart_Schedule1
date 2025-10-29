import React, { useEffect, useState } from "react";
import { Spinner, Offcanvas, Toast, ToastContainer, Button } from "react-bootstrap";
import api from "../../Services/apiClient";

export default function Feedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters
  const [typeFilter, setTypeFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch] = useState("");

  // Offcanvas
  const [showDetail, setShowDetail] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  // Toast (messages)
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "info" }), 2500);
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await api.get("/feedback");
      setFeedbacks(res.data || []);
      showToast("✅ Feedback loaded successfully", "success");
    } catch (err) {
      console.error(err);
      showToast("❌ Failed to load feedback", "danger");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Apply filters
  const filteredFeedbacks = feedbacks.filter((f) => {
    const matchType = typeFilter ? f.type === typeFilter : true;
    const matchRole = roleFilter ? f.role === roleFilter : true;
    const matchSearch = f.text.toLowerCase().includes(search.toLowerCase());
    return matchType && matchRole && matchSearch;
  });

  return (
    <div>
      {/* 🔔 Toast messages */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          bg={toast.type}
          show={toast.show}
          onClose={() => setToast({ show: false })}
        >
          <Toast.Body className="text-white">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="text-info m-0">Feedback</h3>
        <Button
          variant="outline-info"
          size="sm"
          disabled={actionLoading}
          onClick={async () => {
            setActionLoading(true);
            await fetchFeedbacks();
            setActionLoading(false);
          }}
        >
          {actionLoading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" /> Refreshing...
            </>
          ) : (
            "Refresh"
          )}
        </Button>
      </div>

      {/* Filters */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        <select
          className="form-select w-auto"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="suggestion">Suggestion</option>
          <option value="bug">Bug</option>
          <option value="question">Question</option>
        </select>

        <select
          className="form-select w-auto"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="student">Student</option>
          <option value="faculty">Faculty</option>
          <option value="committee">Committee</option>
          <option value="registrar">Registrar</option>
        </select>

        <input
          type="text"
          className="form-control w-auto"
          placeholder="Search in feedback..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="info" style={{ width: "3rem", height: "3rem" }} />
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered align-middle text-center">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Role</th>
                <th>Type</th>
                <th>Text (Preview)</th>
                <th>Date</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              {filteredFeedbacks.map((f) => (
                <tr key={f.id}>
                  <td>{f.id}</td>
                  <td>{f.email}</td>
                  <td>{f.role}</td>
                  <td>
                    <span
                      className={`badge ${
                        f.type === "bug"
                          ? "bg-danger"
                          : f.type === "suggestion"
                          ? "bg-info"
                          : "bg-warning"
                      }`}
                    >
                      {f.type}
                    </span>
                  </td>
                  <td>{f.text.length > 50 ? f.text.substring(0, 50) + "…" : f.text}</td>
                  <td>{new Date(f.created_at).toLocaleDateString()}</td>
                  <td>
                    <Button
                      variant="outline-info"
                      size="sm"
                      onClick={() => {
                        setSelectedFeedback(f);
                        setShowDetail(true);
                      }}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredFeedbacks.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-muted text-center">
                    No feedback found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Offcanvas Detail */}
      <Offcanvas
        show={showDetail}
        onHide={() => setShowDetail(false)}
        placement="end"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Feedback Details</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {selectedFeedback ? (
            <div>
              <p>
                <strong>Email:</strong> {selectedFeedback.email}
              </p>
              <p>
                <strong>Role:</strong> {selectedFeedback.role}
              </p>
              <p>
                <strong>Type:</strong>{" "}
                <span className="badge bg-info">{selectedFeedback.type}</span>
              </p>
              <p>
                <strong>Text:</strong>
              </p>
              <div className="border rounded p-2 bg-light">
                {selectedFeedback.text}
              </div>
              <p className="mt-3 text-muted small">
                Created at: {new Date(selectedFeedback.created_at).toLocaleString()}
              </p>
            </div>
          ) : (
            <p className="text-muted">No feedback selected</p>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
}
