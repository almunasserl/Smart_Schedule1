

import React, { useState, useEffect } from "react";
import { Calendar, X } from "lucide-react";

export default function Surveys() {
  // Tab state
  const [activeTab, setActiveTab] = useState("create");

  // Create Survey Form
  const [newSurvey, setNewSurvey] = useState({
    title: "",
    dept_id: 1, // You may want to get this from user context
    level_id: 1, // You may want to get this from user context
    start_date: "",
    end_date: "",
    courses: []
  });
  const [creating, setCreating] = useState(false);

  // View Results
  const [surveys, setSurveys] = useState([]);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 2500);
  };

  // API Base URL - Update this to your backend URL
  const API_BASE_URL = "http://localhost:5001/api/surveys";

  // Fetch all surveys on component mount
  useEffect(() => {
    if (activeTab === "view") {
      fetchAllSurveys();
    }
  }, [activeTab]);

  const fetchAllSurveys = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_BASE_URL);
      if (!response.ok) throw new Error("Failed to fetch surveys");
      const data = await response.json();
      setSurveys(data);
    } catch (error) {
      showToast("Error loading surveys: " + error.message, "danger");
    } finally {
      setLoading(false);
    }
  };

  const [courseInput, setCourseInput] = useState("");

  const handleAddCourse = () => {
    if (courseInput && courseInput.trim()) {
      setNewSurvey({
        ...newSurvey,
        courses: [...newSurvey.courses, courseInput.trim()]
      });
      setCourseInput(""); // Clear input after adding
    }
  };

  const handleRemoveCourse = (index) => {
    setNewSurvey({
      ...newSurvey,
      courses: newSurvey.courses.filter((_, i) => i !== index)
    });
  };

  const handlePublish = async () => {
    if (!newSurvey.title || !newSurvey.start_date || !newSurvey.end_date) {
      showToast("Please fill all required fields", "warning");
      return;
    }
    if (newSurvey.courses.length === 0) {
      showToast("Please add at least one elective course", "warning");
      return;
    }

    setCreating(true);
    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newSurvey.title,
          dept_id: newSurvey.dept_id,
          level_id: newSurvey.level_id,
          start_date: newSurvey.start_date,
          end_date: newSurvey.end_date
        }),
      });

      if (!response.ok) throw new Error("Failed to create survey");
      
      const createdSurvey = await response.json();
      
      // TODO: You'll need to create an endpoint to add courses to the survey
      // For now, we'll just show success message
      
      showToast("✅ Survey published successfully!", "success");
      
      // Reset form
      setNewSurvey({
        title: "",
        dept_id: 1,
        level_id: 1,
        start_date: "",
        end_date: "",
        courses: []
      });
      
      // Switch to view tab
      setActiveTab("view");
      fetchAllSurveys();
    } catch (error) {
      showToast("Error creating survey: " + error.message, "danger");
    } finally {
      setCreating(false);
    }
  };

  const handleViewResults = async (survey) => {
    setSelectedSurvey(survey);
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/${survey.id}/results`);
      if (!response.ok) throw new Error("Failed to fetch results");
      const data = await response.json();
      
      // Transform the data to match your current format
      // This is a simplified version - you may need to adjust based on actual data structure
      const transformedResults = data.map(item => ({
        name: item.course_name || "N/A",
        level: item.first_choice || 0,
        status: item.total_votes > 0 ? "active" : "inactive",
        courses: `First: ${item.first_choice}, Second: ${item.second_choice}, Third: ${item.third_choice}`
      }));
      
      setResults(transformedResults);
    } catch (error) {
      showToast("Error loading results: " + error.message, "danger");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="container" style={{ maxWidth: "900px" }}>
      {/* Toasts */}
      {toast.show && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
          <div className={`toast show align-items-center text-white bg-${toast.type} border-0`} role="alert">
            <div className="d-flex">
              <div className="toast-body">
                {toast.message}
              </div>
              <button 
                type="button" 
                className="btn-close btn-close-white me-2 m-auto" 
                onClick={() => setToast({ show: false })}
              ></button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 pt-3">
        <h3 className="text-info mb-0">Scheduling Committee Survey</h3>
        <Calendar size={36} className="text-info" strokeWidth={1.5} />
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item" style={{ flex: 1 }}>
          <button 
            className={`nav-link w-100 ${activeTab === "create" ? "active text-info" : "text-secondary"}`}
            onClick={() => {
              setActiveTab("create");
              setSelectedSurvey(null);
            }}
            style={{ 
              border: "none",
              borderBottom: activeTab === "create" ? "3px solid #0dcaf0" : "1px solid #dee2e6",
              background: "transparent"
            }}
          >
            Create Survey
          </button>
        </li>
        <li className="nav-item" style={{ flex: 1 }}>
          <button 
            className={`nav-link w-100 ${activeTab === "view" ? "active text-info" : "text-secondary"}`}
            onClick={() => setActiveTab("view")}
            style={{ 
              border: "none",
              borderBottom: activeTab === "view" ? "3px solid #0dcaf0" : "1px solid #dee2e6",
              background: "transparent"
            }}
          >
            View Results
          </button>
        </li>
      </ul>

      {/* Create Survey Tab */}
      {activeTab === "create" && (
        <div className="bg-light p-4 rounded">
          <div className="mb-4">
            <label className="form-label text-info fw-semibold">Title</label>
            <input
              type="text"
              className="form-control"
              placeholder="Sem 1 Survey"
              value={newSurvey.title}
              onChange={(e) => setNewSurvey({ ...newSurvey, title: e.target.value })}
            />
          </div>

          <div className="row mb-4">
            <div className="col-md-6 mb-3 mb-md-0">
              <label className="form-label text-info fw-semibold">Start date</label>
              <input
                type="date"
                className="form-control"
                value={newSurvey.start_date}
                onChange={(e) => setNewSurvey({ ...newSurvey, start_date: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label text-info fw-semibold">End date</label>
              <input
                type="date"
                className="form-control"
                value={newSurvey.end_date}
                onChange={(e) => setNewSurvey({ ...newSurvey, end_date: e.target.value })}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label text-info fw-semibold">Elective Courses</label>
            
            <div className="d-flex gap-2 mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Enter course code (e.g., ENG132-Technical Writing)"
                value={courseInput}
                onChange={(e) => setCourseInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCourse();
                  }
                }}
              />
              <button 
                type="button"
                className="btn btn-info text-white"
                onClick={handleAddCourse}
                style={{ whiteSpace: 'nowrap' }}
              >
                Add
              </button>
            </div>

            {newSurvey.courses.map((course, index) => (
              <div 
                key={index}
                className="d-flex justify-content-between align-items-center bg-white p-3 mb-2 rounded border"
              >
                <span>{course}</span>
                <button
                  type="button"
                  className="btn btn-link text-secondary p-0"
                  onClick={() => handleRemoveCourse(index)}
                >
                  <X size={20} />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="btn btn-info text-white"
            onClick={handlePublish}
            disabled={creating}
          >
            {creating ? "Publishing..." : "Publish"}
          </button>
        </div>
      )}

      {/* View Results Tab */}
      {activeTab === "view" && (
        <div>
          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-info" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
          
          {!loading && !selectedSurvey && (
            <div>
              {surveys.map((survey) => (
                <div
                  key={survey.id}
                  className="bg-light p-4 mb-3 rounded"
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h5 className="text-info mb-1">{survey.title}</h5>
                      <p className="text-muted small mb-1">
                        Created on {formatDate(survey.start_date)}
                      </p>
                      <p className="text-muted small mb-1">
                        Status: <span className={`badge bg-${survey.status === 'active' ? 'success' : survey.status === 'closed' ? 'secondary' : 'warning'}`}>
                          {survey.status}
                        </span>
                      </p>
                      <p className="text-muted small mb-0">
                        {survey.dept_name} - Level {survey.level_name}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn btn-info text-white"
                      onClick={() => handleViewResults(survey)}
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
              {surveys.length === 0 && !loading && (
                <div className="text-center text-muted py-5">
                  No surveys found
                </div>
              )}
            </div>
          )}
          
          {!loading && selectedSurvey && (
            <div>
              <button
                type="button"
                className="btn btn-link text-info mb-3 p-0 text-decoration-none"
                onClick={() => setSelectedSurvey(null)}
              >
                ← Back
              </button>
              <h5 className="text-info mb-4">{selectedSurvey.title}</h5>
              
              {results.length > 0 ? (
                <div className="bg-light rounded overflow-hidden">
                  <table className="table mb-0">
                    <thead>
                      <tr className="bg-white border-bottom">
                        <th className="text-info">Course Name</th>
                        <th className="text-center text-info">First Choice</th>
                        <th className="text-center text-info">Status</th>
                        <th className="text-info">Vote Distribution</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result, index) => (
                        <tr 
                          key={index}
                          className={index % 2 === 0 ? "bg-white" : "bg-light"}
                        >
                          <td className="text-info">{result.name}</td>
                          <td className="text-center">{result.level}</td>
                          <td className="text-center">
                            <span className={result.status === "active" ? "text-info" : "text-danger"}>
                              {result.status}
                            </span>
                          </td>
                          <td className="text-info">{result.courses}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center text-muted py-5">
                  No results available
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}