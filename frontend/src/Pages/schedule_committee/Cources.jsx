import React, { useEffect, useState } from "react";
import {
  Offcanvas,
  Button,
  Spinner,
  Toast,
  ToastContainer,
  Modal,
  Form,
} from "react-bootstrap";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import api from "../../Services/apiClient";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({ total: 0, core: 0, elective: 0 });
  const [creditsByDept, setCreditsByDept] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [terms, setTerms] = useState([]);
  const [facultyList, setFacultyList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [termFilter, setTermFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [assigning, setAssigning] = useState(false);

  const [newCourse, setNewCourse] = useState({
    id: null,
    code: "",
    name: "",
    type: "",
    dept_id: "",
    term_id: "",
    credit_hours: "",
  });

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
    await Promise.all([
      fetchCourses(),
      fetchStats(),
      fetchCredits(),
      fetchDropdowns(),
    ]);
    setPageLoading(false);
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get("/courses");
      setCourses(res.data);
    } catch (err) {
      showToast("Failed to load courses", "danger");
    }
  };

  const fetchStats = async () => {
    try {
      const totalRes = await api.get("/reports/courses/total");
      const typesRes = await api.get("/reports/courses/types");
      setStats({
        total: totalRes.data.total_courses,
        core: typesRes.data.core_courses,
        elective: typesRes.data.elective_courses,
      });
    } catch {
      showToast("Failed to load stats", "danger");
    }
  };

  const fetchCredits = async () => {
    try {
      const res = await api.get("/reports/courses/credits");
      setCreditsByDept(res.data || []);
    } catch {
      showToast("Failed to load credit hours", "danger");
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [deptRes, termRes] = await Promise.all([
        api.get("/dropdowns/departments"),
        api.get("/dropdowns/terms"),
      ]);
      setDepartments(deptRes.data || []);
      setTerms(termRes.data || []);
    } catch {
      showToast("Failed to load dropdowns", "danger");
    }
  };

  const fetchFaculty = async () => {
    try {
      const res = await api.get("/dropdowns/faculty");
      setFacultyList(res.data || []);
    } catch {
      showToast("Failed to load faculty list", "danger");
    }
  };

  const handleSave = async () => {
    if (!newCourse.code || !newCourse.name || !newCourse.type) {
      showToast("Please fill all required fields", "warning");
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await api.patch(`/courses/${newCourse.id}`, newCourse);
        showToast("✅ Course updated successfully!", "success");
      } else {
        await api.post("/courses", newCourse);
        showToast("✅ Course created successfully!", "success");
      }
      await Promise.all([fetchCourses(), fetchStats(), fetchCredits()]);
      setShowOffcanvas(false);
      resetForm();
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to save course";
      showToast(msg, "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (course) => {
    setNewCourse(course);
    setIsEditing(true);
    setShowOffcanvas(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    setActionId(id);
    try {
      await api.delete(`/courses/${id}`);
      showToast("🗑️ Course deleted successfully", "success");
      await Promise.all([fetchCourses(), fetchStats(), fetchCredits()]);
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to delete course";
      showToast(msg, "danger");
    } finally {
      setActionId(null);
    }
  };

  const handleAssignFaculty = async () => {
    if (!selectedFaculty) {
      showToast("Please select a faculty", "warning");
      return;
    }

    setAssigning(true);
    try {
      await api.post("/faculty-courses", {
        faculty_id: selectedFaculty,
        course_id: selectedCourse.id,
      });

      showToast("✅ Faculty assigned successfully!", "success");
      setShowAssignModal(false);
      setSelectedFaculty("");
      setSelectedCourse(null);
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to assign faculty";
      showToast(msg, "danger");
    } finally {
      setAssigning(false);
    }
  };

  const resetForm = () => {
    setNewCourse({
      id: null,
      code: "",
      name: "",
      type: "",
      dept_id: "",
      term_id: "",
      credit_hours: "",
    });
    setIsEditing(false);
  };

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter ? c.dept_id === parseInt(deptFilter) : true;
    const matchesTerm = termFilter ? c.term_id === parseInt(termFilter) : true;
    const matchesType = typeFilter ? c.type === typeFilter : true;
    return matchesSearch && matchesDept && matchesTerm && matchesType;
  });

  const barData = {
    labels: creditsByDept.map((d) => d.department),
    datasets: [
      {
        label: "Total Credit Hours",
        data: creditsByDept.map((d) => d.total_credit_hours),
        backgroundColor: "#0dcaf0",
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
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
      {/* Toast */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          bg={toast.type}
          show={toast.show}
          onClose={() => setToast({ show: false })}
        >
          <Toast.Body className="text-white">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="text-info">Courses</h3>
        <Button
          variant="info"
          className="text-white"
          onClick={() => {
            resetForm();
            setShowOffcanvas(true);
          }}
        >
          + Add Course
        </Button>
      </div>

      {/* Stats */}
      <div className="row mb-4 g-3">
        <div className="col-md-4">
          <div className="card text-center shadow-sm h-100">
            <div className="card-body">
              <h6>Total Courses</h6>
              <h4 className="text-info">{stats.total}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center shadow-sm h-100">
            <div className="card-body">
              <h6>Core vs Elective</h6>
              <div className="d-flex justify-content-around mt-2">
                <div>
                  <h4 className="text-success">{stats.core}</h4>
                  <small>Core</small>
                </div>
                <div>
                  <h4 className="text-warning">{stats.elective}</h4>
                  <small>Elective</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-center text-info">
                Credit Hours by Department
              </h6>
              <div style={{ height: "220px" }}>
                <Bar data={barData} options={barOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label">Department</label>
              <select
                className="form-select"
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
              >
                <option value="">All</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Term</label>
              <select
                className="form-select"
                value={termFilter}
                onChange={(e) => setTermFilter(e.target.value)}
              >
                <option value="">All</option>
                {terms.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Type</label>
              <select
                className="form-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All</option>
                <option value="core">Core</option>
                <option value="elective">Elective</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Search</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Courses Table */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="mb-3 text-info">Courses List</h5>
          <div className="table-responsive">
            <table className="table table-bordered table-striped align-middle text-center">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Credits</th>
                  <th>Dept</th>
                  <th>Term</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.code}</td>
                    <td>{c.name}</td>
                    <td>{c.type}</td>
                    <td>{c.credit_hours}</td>
                    <td>{c.dept_name || c.dept_id}</td>
                    <td>{c.term_name || c.term_id}</td>
                    <td>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="me-2"
                        onClick={() => {
                          setSelectedCourse(c);
                          fetchFaculty();
                          setShowAssignModal(true);
                        }}
                      >
                        Assign Faculty
                      </Button>

                      <Button
                        size="sm"
                        variant="warning"
                        className="me-2"
                        onClick={() => handleEdit(c)}
                        disabled={actionId === c.id}
                      >
                        {actionId === c.id && isEditing ? (
                          <Spinner size="sm" animation="border" />
                        ) : (
                          "Edit"
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(c.id)}
                        disabled={actionId === c.id}
                      >
                        {actionId === c.id ? (
                          <Spinner size="sm" animation="border" />
                        ) : (
                          "Delete"
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredCourses.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center text-muted">
                      No courses found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Assign Faculty Modal */}
      <Modal
        show={showAssignModal}
        onHide={() => setShowAssignModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Assign Faculty</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCourse && (
            <>
              <p>
                <strong>Course:</strong> {selectedCourse.name} (
                {selectedCourse.code})
              </p>
              <Form.Group className="mb-3">
                <Form.Label>Select Faculty</Form.Label>
                <Form.Select
                  value={selectedFaculty}
                  onChange={(e) => setSelectedFaculty(e.target.value)}
                >
                  <option value="">-- Choose Faculty --</option>
                  {facultyList.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowAssignModal(false)}
            disabled={assigning}
          >
            Cancel
          </Button>
          <Button
            variant="info"
            onClick={handleAssignFaculty}
            disabled={assigning}
          >
            {assigning ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />{" "}
                Assigning...
              </>
            ) : (
              "Assign"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add/Edit Offcanvas */}
      <Offcanvas
        show={showOffcanvas}
        onHide={() => setShowOffcanvas(false)}
        placement="end"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            {isEditing ? "Edit Course" : "Add Course"}
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="mb-3">
            <label className="form-label">Code</label>
            <input
              type="text"
              className="form-control"
              value={newCourse.code}
              onChange={(e) =>
                setNewCourse({ ...newCourse, code: e.target.value })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              value={newCourse.name}
              onChange={(e) =>
                setNewCourse({ ...newCourse, name: e.target.value })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Type</label>
            <select
              className="form-select"
              value={newCourse.type}
              onChange={(e) =>
                setNewCourse({ ...newCourse, type: e.target.value })
              }
            >
              <option value="">Select Type</option>
              <option value="core">Core</option>
              <option value="elective">Elective</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Department</label>
            <select
              className="form-select"
              value={newCourse.dept_id}
              onChange={(e) =>
                setNewCourse({ ...newCourse, dept_id: e.target.value })
              }
            >
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Term</label>
            <select
              className="form-select"
              value={newCourse.term_id}
              onChange={(e) =>
                setNewCourse({ ...newCourse, term_id: e.target.value })
              }
            >
              <option value="">Select Term</option>
              {terms.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Credit Hours</label>
            <input
              type="number"
              className="form-control"
              value={newCourse.credit_hours}
              onChange={(e) =>
                setNewCourse({ ...newCourse, credit_hours: e.target.value })
              }
            />
          </div>
          <Button
            className="w-100 mt-2"
            variant="info"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />{" "}
                Saving...
              </>
            ) : isEditing ? (
              "Update"
            ) : (
              "Save"
            )}
          </Button>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
}
