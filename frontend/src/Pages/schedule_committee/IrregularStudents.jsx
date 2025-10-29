import React, { useEffect, useState } from "react";
import {
  Button,
  Spinner,
  Toast,
  ToastContainer,
  Modal,
  Form,
  Table,
} from "react-bootstrap";
import api from "../../Services/apiClient";

export default function IrregularStudents() {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [levels, setLevels] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [allCourses, setAllCourses] = useState([]);

  const [deptFilter, setDeptFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Toast
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 2500);
  };

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [current, setCurrent] = useState({
    id: null,
    student_id: "",
    remaining_courses: [],
    required_courses: [],
  });

  useEffect(() => {
    loadPage();
  }, []);

  const loadPage = async () => {
    setLoading(true);
    await Promise.all([
      fetchDropdowns(),
      fetchIrregularStudents(),
      fetchStudentsList(),
      fetchCoursesList(),
    ]);
    setLoading(false);
  };

  const fetchDropdowns = async () => {
    try {
      const [deptRes, levelRes] = await Promise.all([
        api.get("/dropdowns/departments"),
        api.get("/dropdowns/terms"),
      ]);
      setDepartments(deptRes.data || []);
      setLevels(levelRes.data || []);
    } catch {
      showToast("Error loading dropdowns", "danger");
    }
  };

  const fetchStudentsList = async () => {
    try {
      const res = await api.get("/students");
      setAllStudents(res.data || []);
    } catch {
      showToast("Error loading students list", "danger");
    }
  };

  const fetchCoursesList = async () => {
    try {
      const res = await api.get("/courses");
      setAllCourses(res.data || []);
    } catch {
      showToast("Error loading courses list", "danger");
    }
  };

  const fetchIrregularStudents = async () => {
    try {
      const res = await api.get("/students/irregular");
      setStudents(res.data || []);
    } catch {
      showToast("Error loading irregular students", "danger");
    }
  };

  const filtered = students.filter((s) => {
    const matchesDept = deptFilter
      ? s.dept_id?.toString() === deptFilter
      : true;
    const matchesLevel = levelFilter
      ? s.level_id?.toString() === levelFilter
      : true;
    const matchesSearch = search
      ? s.name?.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchesDept && matchesLevel && matchesSearch;
  });

  // Open create modal
  const handleCreate = () => {
    setCurrent({
      id: null,
      student_id: "",
      remaining_courses: [],
      required_courses: [],
    });
    setEditing(false);
    setShowModal(true);
  };

  // Open edit modal
  const handleEdit = (s) => {
    setCurrent({
      id: s.id,
      student_id: s.student_id,
      remaining_courses: s.remaining_courses || [],
      required_courses: s.required_courses || [],
    });
    setEditing(true);
    setShowModal(true);
  };

  // Save
  const handleSave = async () => {
    if (!current.student_id) {
      showToast("Select a student first", "warning");
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await api.put(`/students/irregular/${current.id}`, current);
        showToast("✅ Updated successfully", "success");
      } else {
        await api.post("/students/irregular", current);
        showToast("✅ Created successfully", "success");
      }
      setShowModal(false);
      await fetchIrregularStudents();
    } catch {
      showToast("Error saving data", "danger");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="info" />
      </div>
    );

  return (
    <div className="container-fluid">
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
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h3 className="text-info m-0">Irregular Students</h3>
        <Button variant="info" onClick={handleCreate}>
          + Add Irregular Student
        </Button>
      </div>

      {/* Filters */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-3 col-6">
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

            <div className="col-md-3 col-6">
              <label className="form-label">Level</label>
              <select
                className="form-select"
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
              >
                <option value="">All</option>
                {levels.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4 col-12">
              <label className="form-label">Search</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card shadow-sm">
        <div className="card-body">
          <Table bordered hover responsive className="align-middle text-center">
            <thead className="table-light">
              <tr>
                <th>Student Name</th>
                <th>Level</th>
                <th>Remaining Courses</th>
                <th>Required This Term</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td>{s.student_name}</td>
                  <td>{s.level_name}</td>
                  <td>
                    {s.remaining_courses?.length
                      ? s.remaining_courses.join(", ")
                      : "-"}
                  </td>
                  <td>
                    {s.required_courses?.length
                      ? s.required_courses.join(", ")
                      : "-"}
                  </td>
                  <td>
                    <Button
                      variant="outline-info"
                      size="sm"
                      onClick={() => handleEdit(s)}
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-muted">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editing ? "Edit Irregular Student" : "Add Irregular Student"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label className="form-label">Student</label>
            <select
              className="form-select"
              value={current.student_id}
              onChange={(e) =>
                setCurrent({ ...current, student_id: e.target.value })
              }
              disabled={editing}
            >
              <option value="">-- Select Student --</option>
              {allStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Remaining Courses</label>
            <Form>
              {allCourses.map((c) => (
                <Form.Check
                  key={c.id}
                  type="checkbox"
                  id={`rem-${c.id}`}
                  label={`${c.code}`}
                  checked={current.remaining_courses.includes(c.code)}
                  onChange={() => {
                    const exists = current.remaining_courses.includes(c.code);
                    const updated = exists
                      ? current.remaining_courses.filter((x) => x !== c.code)
                      : [...current.remaining_courses, c.code];
                    setCurrent({ ...current, remaining_courses: updated });
                  }}
                />
              ))}
            </Form>
          </div>

          <div className="mb-3">
            <label className="form-label">Required This Term</label>
            <Form>
              {allCourses.map((c) => (
                <Form.Check
                  key={`req-${c.id}`}
                  type="checkbox"
                  id={`req-${c.id}`}
                  label={`${c.code}`}
                  checked={current.required_courses.includes(c.code)}
                  onChange={() => {
                    const exists = current.required_courses.includes(c.code);
                    const updated = exists
                      ? current.required_courses.filter((x) => x !== c.code)
                      : [...current.required_courses, c.code];
                    setCurrent({ ...current, required_courses: updated });
                  }}
                />
              ))}
            </Form>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="info" onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Spinner animation="border" size="sm" /> Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
