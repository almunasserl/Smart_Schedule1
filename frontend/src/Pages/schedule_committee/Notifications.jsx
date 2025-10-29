// src/pages/Notifications.jsx
import React, { useEffect, useState } from "react";
import { Button, Spinner, Modal } from "react-bootstrap";
import api from "../../Services/apiClient";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch] = useState("");

  // Modal create
  const [showCreate, setShowCreate] = useState(false);
  const [newNotif, setNewNotif] = useState({
    title: "",
    description: "",
    role: "",
    user_id: "",
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadPage();
  }, []);

  const loadPage = async () => {
    setLoading(true);
    await Promise.all([fetchNotifications(), fetchReports()]);
    setLoading(false);
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReports = async () => {
    try {
      const [totalRes, roleRes, statusRes] = await Promise.all([
        api.get("/reports/notifications/total"),
        api.get("/reports/notifications/by-role"),
        api.get("/reports/notifications/by-status"),
      ]);
      setStats({
        total: totalRes.data.total_notifications,
        byRole: roleRes.data,
        byStatus: statusRes.data,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) return;
    try {
      await api.delete(`/notifications/${id}`);
      fetchNotifications();
      fetchReports();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const endpoint =
        currentStatus === "draft"
          ? `/notifications/${id}/publish`
          : `/notifications/${id}/draft`;
      await api.patch(endpoint);
      fetchNotifications();
      fetchReports();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async () => {
    if (!newNotif.title || !newNotif.description) return;
    setCreating(true);
    try {
      await api.post("/notifications", newNotif);
      setShowCreate(false);
      setNewNotif({ title: "", description: "", role: "", user_id: "" });
      fetchNotifications();
      fetchReports();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  // Filters apply
  const filtered = notifications.filter((n) => {
    const matchRole = roleFilter ? n.role === roleFilter : true;
    const matchSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.description.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="text-info">Notifications</h3>
        <Button variant="info" className="text-white" onClick={() => setShowCreate(true)}>
          + Create Notification
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="row mb-4 g-3">
          {/* Total */}
          <div className="col-md-3 col-6">
            <div className="card text-center shadow-sm h-100">
              <div className="card-body">
                <h6>Total</h6>
                <h4 className="text-info">{stats.total}</h4>
              </div>
            </div>
          </div>

          {/* By Role */}
          {stats.byRole.map((r, i) => (
            <div className="col-md-3 col-6" key={i}>
              <div className="card text-center shadow-sm h-100">
                <div className="card-body">
                  <h6>{r.role}</h6>
                  <h4>{r.total_notifications}</h4>
                </div>
              </div>
            </div>
          ))}

          {/* By Status */}
          {stats.byStatus.map((s, i) => (
            <div className="col-md-3 col-6" key={i}>
              <div className="card text-center shadow-sm h-100">
                <div className="card-body">
                  <h6>{s.status}</h6>
                  <h4>{s.total_notifications}</h4>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="d-flex gap-2 mb-3 flex-wrap">
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
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="info" />
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered align-middle text-center">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Description</th>
                <th>Role</th>
                <th>User</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((n) => (
                <tr key={n.id}>
                  <td>{n.id}</td>
                  <td>{n.title}</td>
                  <td>
                    {n.description.length > 50
                      ? n.description.slice(0, 50) + "…"
                      : n.description}
                  </td>
                  <td>{n.role || "-"}</td>
                  <td>{n.user_id || "-"}</td>
                  <td>
                    <span
                      className={`badge ${
                        n.status === "published" ? "bg-success" : "bg-secondary"
                      }`}
                    >
                      {n.status}
                    </span>
                  </td>
                  <td>{new Date(n.created_at).toLocaleString()}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="outline-primary"
                      className="me-2"
                      onClick={() => handleToggleStatus(n.id, n.status)}
                    >
                      {n.status === "draft" ? "Publish" : "Unpublish"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleDelete(n.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center text-muted">
                    No notifications found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      <Modal show={showCreate} onHide={() => setShowCreate(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create Notification</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-control"
              value={newNotif.title}
              onChange={(e) => setNewNotif({ ...newNotif, title: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows="3"
              value={newNotif.description}
              onChange={(e) =>
                setNewNotif({ ...newNotif, description: e.target.value })
              }
            ></textarea>
          </div>
          <div className="mb-3">
            <label className="form-label">Role (Optional)</label>
            <select
              className="form-select"
              value={newNotif.role}
              onChange={(e) => setNewNotif({ ...newNotif, role: e.target.value })}
            >
              <option value="">None</option>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="committee">Committee</option>
              <option value="registrar">Registrar</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">User ID (Optional)</label>
            <input
              type="number"
              className="form-control"
              value={newNotif.user_id}
              onChange={(e) => setNewNotif({ ...newNotif, user_id: e.target.value })}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreate(false)}>
            Cancel
          </Button>
          <Button
            variant="info"
            className="text-white"
            onClick={handleCreate}
            disabled={creating}
          >
            {creating ? <Spinner size="sm" animation="border" /> : "Create"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
