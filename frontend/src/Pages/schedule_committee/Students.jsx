import React, { useEffect, useState } from "react";
import {
  Offcanvas,
  Button,
  Spinner,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import api from "../../Services/apiClient";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

export default function Students() {
  const [students, setStudents] = useState([]);
  const [statusStats, setStatusStats] = useState([]);
  const [deptStats, setDeptStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const [levels, setLevels] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [editStudent, setEditStudent] = useState(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 2500);
  };

  useEffect(() => {
    loadPage();
  }, []);

  const loadPage = async () => {
    setPageLoading(true);
    await Promise.all([fetchStudents(), fetchReports(), fetchDropdowns()]);
    setPageLoading(false);
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get("/students");
      setStudents(res.data);
    } catch (err) {
      showToast("Failed to load students", "danger");
    }
  };

  const fetchReports = async () => {
    try {
      const [statusRes, deptRes] = await Promise.all([
        api.get("/reports/students/status-ratio"),
        api.get("/reports/students/by-department"),
      ]);
      setStatusStats(statusRes.data || []);
      setDeptStats(deptRes.data || []);
    } catch (err) {
      showToast("Failed to load reports", "danger");
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [levelsRes, deptsRes] = await Promise.all([
        api.get("/dropdowns/terms"),
        api.get("/dropdowns/departments"),
      ]);
      setLevels(levelsRes.data || []);
      setDepartments(deptsRes.data || []);
    } catch (err) {
      showToast("Failed to load dropdowns", "danger");
    }
  };

  const handleUpdate = async () => {
    if (!editStudent) return;
    setLoading(true);
    try {
      await api.patch(`/students/${editStudent.id}`, editStudent);
      showToast("✅ Student updated successfully!", "success");
      await fetchStudents();
      setShowOffcanvas(false);
      setEditStudent(null);
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to update student";
      showToast(msg, "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?"))
      return;
    setActionId(id);
    try {
      await api.delete(`/students/${id}`);
      showToast("🗑️ Student deleted successfully!", "success");
      await fetchStudents();
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to delete student";
      showToast(msg, "danger");
    } finally {
      setActionId(null);
    }
  };

  const statusData = {
    labels: statusStats.map((s) => s.status),
    datasets: [
      {
        data: statusStats.map((s) => s.total),
        backgroundColor: ["#0dcaf0", "#0d6efd", "#ffc107", "#dc3545"],
      },
    ],
  };

  const deptData = {
    labels: deptStats.map((d) => d.department),
    datasets: [
      {
        label: "Students",
        data: deptStats.map((d) => d.total_students),
        backgroundColor: "#20c997",
      },
    ],
  };

  const barOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: { legend: { display: false } },
  };

  if (pageLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "80vh" }}
      >
        <Spinner
          animation="border"
          variant="info"
          style={{ width: "3rem", height: "3rem" }}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Toasts */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          bg={toast.type}
          show={toast.show}
          onClose={() => setToast({ show: false })}
        >
          <Toast.Body className="text-white">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>

      <h2 className="mb-4 text-info">Students Management</h2>

      {/* Reports */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm p-3">
            <h6 className="text-info">Students Status</h6>
            <div
              style={{
                height: "280px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Pie data={statusData} />
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm p-3">
            <h6 className="text-info">Students by Department</h6>
            <div style={{ height: "280px" }}>
              <Bar data={deptData} options={barOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="card shadow-sm p-3">
        <h5 className="mb-3 text-info">Students List</h5>
        <div className="table-responsive">
          <table className="table table-bordered table-striped align-middle text-center">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Status</th>
                <th>Department</th>
                <th>Level</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.name}</td>
                  <td>{s.status}</td>
                  <td>{s.department_name}</td>
                  <td>{s.level_name}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="warning"
                      className="me-2"
                      onClick={() => {
                        setEditStudent(s);
                        setShowOffcanvas(true);
                      }}
                      disabled={actionId === s.id}
                    >
                      {actionId === s.id ? (
                        <Spinner size="sm" animation="border" />
                      ) : (
                        "Edit"
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(s.id)}
                      disabled={actionId === s.id}
                    >
                      {actionId === s.id ? (
                        <Spinner size="sm" animation="border" />
                      ) : (
                        "Delete"
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-muted text-center">
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Offcanvas */}
      <Offcanvas
        show={showOffcanvas}
        onHide={() => setShowOffcanvas(false)}
        placement="end"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Edit Student</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {editStudent && (
            <>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={editStudent.name}
                  onChange={(e) =>
                    setEditStudent({ ...editStudent, name: e.target.value })
                  }
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Status</label>
                <input
                  type="text"
                  className="form-control"
                  value={editStudent.status}
                  onChange={(e) =>
                    setEditStudent({ ...editStudent, status: e.target.value })
                  }
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Department</label>
                <select
                  className="form-select"
                  value={editStudent.dept_id}
                  onChange={(e) =>
                    setEditStudent({ ...editStudent, dept_id: e.target.value })
                  }
                >
                  <option value="">-- Select Department --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Level</label>
                <select
                  className="form-select"
                  value={editStudent.level_id}
                  onChange={(e) =>
                    setEditStudent({ ...editStudent, level_id: e.target.value })
                  }
                >
                  <option value="">-- Select Level --</option>
                  {levels.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                className="w-100 mt-2"
                variant="info"
                onClick={handleUpdate}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />{" "}
                    Updating...
                  </>
                ) : (
                  "Update Student"
                )}
              </Button>
            </>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
}
