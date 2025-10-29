
import React, { useState, useEffect } from "react";
import { Edit2 } from "lucide-react";
import apiClient from "../../Services/apiClient";

export default function SchedulingRules() {
  const [rules, setRules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [newRule, setNewRule] = useState({
    id: null,
    rule_name: "",
    work_start: "",
    work_end: "",
    working_days: []
  });

  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

  useEffect(() => {
    fetchRules();
  }, []);



const fetchRules = async () => {
  try {
    const response = await apiClient.get("/rules");
    setRules(response.data || []);
  } catch (error) {
    showToast("Failed to load rules", "danger");
    console.error("Failed to fetch rules:", error);
  }
};


  const toggleDay = (day) => {
    if (newRule.working_days.includes(day)) {
      setNewRule({
        ...newRule,
        working_days: newRule.working_days.filter(d => d !== day)
      });
    } else {
      setNewRule({
        ...newRule,
        working_days: [...newRule.working_days, day]
      });
    }
  };

 const handleSaveRule = async () => {
  if (!newRule.work_start || !newRule.work_end || newRule.working_days.length === 0) {
    showToast("Please fill all required fields", "danger");
    return;
  }

  setLoading(true);
  try {
    if (isEditing) {
      await apiClient.patch(`/rules/${newRule.id}`, {
        rule_name: newRule.rule_name,
        work_start: newRule.work_start,
        work_end: newRule.work_end,
        working_days: newRule.working_days
      });
    } else {
      await apiClient.post("/rules", {
        rule_name: newRule.rule_name,
        work_start: newRule.work_start,
        work_end: newRule.work_end,
        working_days: newRule.working_days
      });
    }

    showToast(isEditing ? "✅ Rule updated successfully!" : "✅ Rule created successfully!", "success");

    // 🟢 Fetch updated list from backend
    await fetchRules();

    // 🟢 Reset and hide form
    resetForm();
    setShowForm(false);
    setIsEditing(false);

  } catch (error) {
    showToast("Error saving rule: " + (error.response?.data?.error || error.message), "danger");
  } finally {
    setLoading(false);
  }
};


const handleDeleteRule = async (id) => {
  if (!window.confirm("Are you sure you want to delete this rule?")) return;

  try {
    await apiClient.delete(`/rules/${id}`);
    showToast("🗑️ Rule deleted successfully", "success");
    fetchRules();
  } catch (error) {
    showToast("Error deleting rule: " + (error.response?.data?.error || error.message), "danger");
  }
};

const handleEdit = (rule) => {
  setNewRule({
    id: rule.id,
    rule_name: rule.rule_name || "",
    work_start: rule.work_start || "",
    work_end: rule.work_end || "",
    working_days: Array.isArray(rule.working_days) ? rule.working_days : [],
    break_start: rule.break_start || null,
    break_end: rule.break_end || null,
    lecture_duration: rule.lecture_duration || 180,
    min_students_to_open_section: rule.min_students_to_open_section || 20
  });
  setIsEditing(true);
  setShowForm(true);
};
  // const handleDeleteRule = async (id) => {
  //   if (!window.confirm("Are you sure you want to delete this rule?")) return;

  //   try {
  //     await fetch(`/api/rules/${id}`, { method: "DELETE" });
  //     showToast("🗑️ Rule deleted successfully", "success");
  //     fetchRules();
  //   } catch (error) {
  //     showToast("Error deleting rule", "danger");
  //   }
  // };

  const resetForm = () => {
    setNewRule({
      id: null,
      rule_name: "",
      work_start: "",
      work_end: "",
      working_days: []
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setIsEditing(false);
    resetForm();
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
          <h3 className="text-info mb-1">Scheduling Rules</h3>
          <p className="text-muted mb-0">Total Rules: {rules.length}</p>
        </div>
        <button
          className="btn btn-info text-white"
          onClick={() => {
            if (showForm) {
              handleCancel();
            } else {
              setShowForm(true);
            }
          }}
        >
          {showForm ? "Cancel" : "+ Create Rule"}
        </button>
      </div>

      {showForm && (
        <div className="bg-light p-4 rounded mb-4 shadow-sm">
          <h5 className="text-info mb-4">{isEditing ? "Edit Rule" : "Create Rule"}</h5>

          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label text-info fw-semibold">Rule Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., Standard Working Hours"
                value={newRule.rule_name}
                onChange={(e) => setNewRule({ ...newRule, rule_name: e.target.value })}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label text-info fw-semibold">Start Time</label>
              <input
                type="time"
                className="form-control"
                value={newRule.work_start}
                onChange={(e) => setNewRule({ ...newRule, work_start: e.target.value })}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label text-info fw-semibold">End Time</label>
              <input
                type="time"
                className="form-control"
                value={newRule.work_end}
                onChange={(e) => setNewRule({ ...newRule, work_end: e.target.value })}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label text-info fw-semibold mb-3">Select Working Days</label>
            <div className="d-flex flex-wrap gap-3">
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className={`border rounded p-3 ${
                    newRule.working_days.includes(day)
                      ? "bg-info text-white border-info"
                      : "bg-white text-dark border-secondary"
                  }`}
                  style={{ 
                    cursor: "pointer", 
                    minWidth: "120px", 
                    textAlign: "center",
                    transition: "all 0.2s",
                    userSelect: "none"
                  }}
                  onClick={() => toggleDay(day)}
                >
                  <strong>{day}</strong>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="btn btn-info text-white"
            onClick={handleSaveRule}
            disabled={loading}
          >
            {loading ? "Saving..." : isEditing ? "Update Rule" : "Save Rule"}
          </button>
        </div>
      )}

      <div className="bg-white rounded shadow-sm overflow-hidden">
        <div className="p-3 bg-light border-bottom">
          <h5 className="text-info mb-0">Rules List</h5>
        </div>

        {rules.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="text-info">Rule Name</th>
                  <th className="text-info">Start Time</th>
                  <th className="text-info">End Time</th>
                  <th className="text-info">Working Days</th>
                  <th className="text-info">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => (
                  <tr key={rule.id}>
                    <td className="fw-semibold">{rule.rule_name || "N/A"}</td>
                    <td>{rule.work_start?.slice(0, 5)}</td>
                    <td>{rule.work_end?.slice(0, 5)}</td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {(Array.isArray(rule.working_days) ? rule.working_days : []).map((day, idx) => (
                          <span key={idx} className="badge bg-info text-white">
                            {day}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => handleEdit(rule)}
                      >
                        <Edit2 size={14} className="me-1" />
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteRule(rule.id)}
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
            <p>No rules found. Create your first scheduling rule above.</p>
          </div>
        )}
      </div>
    </div>
  );
}