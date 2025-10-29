
import React, { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import apiClient from "../../Services/apiClient";

export default function CreateSection() {
  const [sections, setSections] = useState([]);
  const [courses, setCourses] = useState([]);
  const [rules, setRules] = useState([]);
  const [activeRule, setActiveRule] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [newSection, setNewSection] = useState({
    course_id: "",
    type: "",
    days: [{ day: "", start_time: "", end_time: "" }]
  });

  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const sectionTypes = ["Lecture", "Tutorial", "Lab"];

  useEffect(() => {
    fetchCourses();
    fetchSections();
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const response = await apiClient.get("/rules");
      setRules(response.data || []);
      // Set the first rule as active by default
      if (response.data && response.data.length > 0) {
        setActiveRule(response.data[0]);
      }
    } catch (error) {
      console.error("Failed to fetch rules:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await apiClient.get("/dropdowns/courses");
      setCourses(response.data || []);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    }
  };

  const fetchSections = async () => {
    try {
      const response = await apiClient.get("/simple-sections");
      setSections(response.data || []);
    } catch (error) {
      showToast("Failed to load sections", "danger");
      console.error("Failed to fetch sections:", error);
    }
  };

  const validateTimeWithRules = (start_time, end_time) => {
    if (!activeRule) {
      showToast("No scheduling rule found. Please create a rule first.", "warning");
      return false;
    }

    const { work_start, work_end, break_start, break_end } = activeRule;

    // Check if times are within working hours
    if (start_time < work_start || end_time > work_end) {
      showToast(`Time must be between ${work_start} and ${work_end}`, "warning");
      return false;
    }

    // Check if section overlaps with break time
    if (break_start && break_end) {
      if (
        (start_time >= break_start && start_time < break_end) ||
        (end_time > break_start && end_time <= break_end) ||
        (start_time <= break_start && end_time >= break_end)
      ) {
        showToast(`Section cannot overlap with break time (${break_start} - ${break_end})`, "warning");
        return false;
      }
    }

    return true;
  };

  const handleAddDay = () => {
    setNewSection({
      ...newSection,
      days: [...newSection.days, { day: "", start_time: "", end_time: "" }]
    });
  };

  const handleRemoveDay = (index) => {
    if (newSection.days.length === 1) {
      showToast("At least one day is required", "warning");
      return;
    }
    setNewSection({
      ...newSection,
      days: newSection.days.filter((_, i) => i !== index)
    });
  };

  const handleDayChange = (index, field, value) => {
    const updatedDays = [...newSection.days];
    updatedDays[index][field] = value;
    setNewSection({ ...newSection, days: updatedDays });
  };

  const handleSaveSection = async () => {
    if (!newSection.course_id || !newSection.type) {
      showToast("Please select course and type", "warning");
      return;
    }

    // Validate all days
    for (let i = 0; i < newSection.days.length; i++) {
      const day = newSection.days[i];
      if (!day.day || !day.start_time || !day.end_time) {
        showToast(`Please complete Day ${i + 1} information`, "warning");
        return;
      }

      // Validate day is in working days
      if (activeRule && !activeRule.working_days.includes(day.day)) {
        showToast(`${day.day} is not a working day according to the rule`, "warning");
        return;
      }

      // Validate time with rules
      if (!validateTimeWithRules(day.start_time, day.end_time)) {
        return;
      }
    }

    setLoading(true);
    try {
      const promises = newSection.days.map(dayInfo =>
        apiClient.post("/simple-sections", {
          course_id: parseInt(newSection.course_id),
          type: newSection.type,
          day_of_week: dayInfo.day,
          start_time: dayInfo.start_time,
          end_time: dayInfo.end_time
        })
      );

      const results = await Promise.all(promises);
      console.log("✅ Sections created:", results);

      showToast("✅ Section(s) created successfully!", "success");
      setShowForm(false);
      setNewSection({
        course_id: "",
        type: "",
        days: [{ day: "", start_time: "", end_time: "" }]
      });
      fetchSections();
    } catch (error) {
      console.error("Error creating section:", error.response?.data || error.message);
      showToast(error.response?.data?.error || "Error creating section", "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSection = async (id) => {
    if (!window.confirm("Are you sure you want to delete this section?")) return;

    try {
      await apiClient.delete(`/simple-sections/${id}`);
      showToast("🗑️ Section deleted successfully", "success");
      fetchSections();
    } catch (error) {
      console.error("Error deleting section:", error);
      showToast("Error deleting section", "danger");
    }
  };

  return (
    <div className="container" style={{ maxWidth: "1200px", padding: "20px" }}>
      {toast.show && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
          <div className={`alert alert-${toast.type} alert-dismissible fade show`} role="alert">
            {toast.message}
            <button type="button" className="btn-close" onClick={() => setToast({ show: false })}></button>
          </div>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="text-info mb-1">Create Section</h3>
          <p className="text-muted mb-0">Total Sections: {sections.length}</p>
          {activeRule && (
            <small className="text-muted">
              Active Rule: {activeRule.rule_name} ({activeRule.work_start} - {activeRule.work_end})
            </small>
          )}
        </div>
        <button
          className="btn btn-info text-white"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "+ Create Section"}
        </button>
      </div>

      {showForm && (
        <div className="bg-light p-4 rounded mb-4 shadow-sm">
          <h5 className="text-info mb-4">New Section</h5>

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label text-info fw-semibold">Course</label>
              <select
                className="form-select"
                value={newSection.course_id}
                onChange={(e) => setNewSection({ ...newSection, course_id: e.target.value })}
              >
                <option value="">-- Select Course --</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label text-info fw-semibold">Type</label>
              <select
                className="form-select"
                value={newSection.type}
                onChange={(e) => setNewSection({ ...newSection, type: e.target.value })}
              >
                <option value="">-- Select Type --</option>
                {sectionTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label text-info fw-semibold">Days and Times</label>

            {newSection.days.map((dayInfo, index) => (
              <div key={index} className="bg-white p-3 mb-2 rounded border">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-semibold text-secondary">Day {index + 1}</span>
                  {newSection.days.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-link text-danger p-0"
                      onClick={() => handleRemoveDay(index)}
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>

                <div className="row">
                  <div className="col-md-4">
                    <label className="form-label small">Day</label>
                    <select
                      className="form-select form-select-sm"
                      value={dayInfo.day}
                      onChange={(e) => handleDayChange(index, "day", e.target.value)}
                    >
                      <option value="">Select Day</option>
                      {activeRule && activeRule.working_days.map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small">Start Time</label>
                    <input
                      type="time"
                      className="form-control form-control-sm"
                      value={dayInfo.start_time}
                      min={activeRule?.work_start}
                      max={activeRule?.work_end}
                      onChange={(e) => handleDayChange(index, "start_time", e.target.value)}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small">End Time</label>
                    <input
                      type="time"
                      className="form-control form-control-sm"
                      value={dayInfo.end_time}
                      min={activeRule?.work_start}
                      max={activeRule?.work_end}
                      onChange={(e) => handleDayChange(index, "end_time", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              className="btn btn-outline-info btn-sm mt-2"
              onClick={handleAddDay}
            >
              <Plus size={16} className="me-1" />
              Add Another Day
            </button>
          </div>

          <button
            type="button"
            className="btn btn-info text-white"
            onClick={handleSaveSection}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Section"}
          </button>
        </div>
      )}

      <div className="bg-white rounded shadow-sm overflow-hidden">
        <div className="p-3 bg-light border-bottom">
          <h5 className="text-info mb-0">Sections List</h5>
        </div>

        {sections.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="text-info">Course</th>
                  <th className="text-info">Type</th>
                  <th className="text-info">Day</th>
                  <th className="text-info">Time</th>
                  <th className="text-info">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sections.map((section) => (
                  <tr key={section.id}>
                    <td>{section.course_code || "N/A"}</td>
                    <td>
                      <span className="badge bg-info">{section.type || "N/A"}</span>
                    </td>
                    <td>{section.day_of_week}</td>
                    <td>{section.start_time?.slice(0, 5)} - {section.end_time?.slice(0, 5)}</td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteSection(section.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-muted py-5">
            <p>No sections found. Create your first section above.</p>
          </div>
        )}
      </div>
    </div>
  );
}