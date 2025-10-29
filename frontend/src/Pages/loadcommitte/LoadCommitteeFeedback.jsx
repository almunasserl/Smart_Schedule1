import React, { useState } from "react";

export default function LoadCommitteeFeedback() {
  const [activeTab, setActiveTab] = useState("write");
  const [feedbackType, setFeedbackType] = useState("schedule");
  const [feedbackText, setFeedbackText] = useState("");
  const [sending, setSending] = useState(false);
  
  // Mock feedback data for View tab
  const [feedbacks, setFeedbacks] = useState([
    {
      id: 1,
      type: "courses",
      text: "I would like to be assigned to SWE164 instead of CSC132",
      date: "2025-10-10",
      status: "pending"
    },
    {
      id: 2,
      type: "schedule",
      text: "The Tuesday 9 AM slot conflicts with my research time",
      date: "2025-10-12",
      status: "reviewed"
    },
    {
      id: 3,
      type: "courses",
      text: "Please consider assigning me to the Database course",
      date: "2025-10-14",
      status: "pending"
    }
  ]);

  const handleSendFeedback = async () => {
    if (!feedbackText.trim()) {
      alert("Please write your feedback before sending");
      return;
    }

    setSending(true);
    try {
      // Real API call would be here
      // await apiClient.post('/feedback', { type: feedbackType, text: feedbackText });
      
      // Mock success - add to feedbacks list
      setTimeout(() => {
        const newFeedback = {
          id: Date.now(),
          type: feedbackType,
          text: feedbackText,
          date: new Date().toISOString().split('T')[0],
          status: "pending"
        };
        setFeedbacks([newFeedback, ...feedbacks]);
        setFeedbackText("");
        alert("Feedback sent successfully!");
        setSending(false);
      }, 1000);
    } catch (error) {
      console.error("Failed to send feedback:", error);
      alert("Failed to send feedback. Please try again.");
      setSending(false);
    }
  };

  return (
    <div className="container-fluid px-3 px-md-4 py-4" style={{ maxWidth: "1000px" }}>
      <h4 className="text-info mb-4">Feedback</h4>

      {/* Tabs */}
      <div className="mb-4">
        <div className="d-flex gap-3 border-bottom">
          <button
            className={`btn btn-link text-decoration-none pb-2 position-relative ${
              activeTab === "write" ? "text-info fw-semibold" : "text-muted"
            }`}
            onClick={() => setActiveTab("write")}
            style={{ 
              border: "none",
              borderBottom: activeTab === "write" ? "3px solid #17a2b8" : "none"
            }}
          >
            Write Feedback
          </button>
          <button
            className={`btn btn-link text-decoration-none pb-2 position-relative ${
              activeTab === "view" ? "text-info fw-semibold" : "text-muted"
            }`}
            onClick={() => setActiveTab("view")}
            style={{ 
              border: "none",
              borderBottom: activeTab === "view" ? "3px solid #17a2b8" : "none"
            }}
          >
            View Feedback
          </button>
        </div>
      </div>

      {/* Write Feedback Tab Content */}
      {activeTab === "write" && (
        <div className="bg-white rounded-3 shadow-sm p-3 p-md-4">
          {/* Feedback Type - Only Schedule for Load Committee */}
          <div className="mb-4">
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="feedbackType"
                id="onSchedule"
                value="schedule"
                checked={true}
                readOnly
                style={{ cursor: "not-allowed" }}
              />
              <label 
                className="form-check-label" 
                htmlFor="onSchedule"
                style={{ cursor: "default", color: "#6c757d", fontWeight: "500" }}
              >
                On Faculty Schedule
              </label>
            </div>
            <small className="text-muted">Load Committee can only provide feedback on faculty schedules.</small>
          </div>

          {/* Feedback Text Area */}
          <div className="mb-4">
            <textarea
              className="form-control"
              rows="6"
              placeholder="Write your feedback here..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              style={{ 
                backgroundColor: "#f8f9fa",
                border: "1px solid #dee2e6",
                resize: "none"
              }}
            />
          </div>

          {/* Send Button */}
          <div className="text-end">
            <button
              className="btn btn-info text-white px-4 py-2"
              onClick={handleSendFeedback}
              disabled={sending}
              style={{ minWidth: "100px" }}
            >
              {sending ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Sending...
                </>
              ) : (
                "Send"
              )}
            </button>
          </div>
        </div>
      )}

      {/* View Feedback Tab Content */}
      {activeTab === "view" && (
        <div className="bg-white rounded-3 shadow-sm p-3 p-md-4">
          {feedbacks.filter(feedback => feedback.type === "schedule").length === 0 ? (
            <div className="text-center py-5">
              <h5 className="text-muted">No Schedule Feedback Yet</h5>
              <p className="text-muted mb-0">Your submitted schedule-related feedback will appear here.</p>
            </div>
          ) : (
            <div className="row g-3">
              {feedbacks.filter(feedback => feedback.type === "schedule").map((feedback) => (
                <div key={feedback.id} className="col-12">
                  <div 
                    className="border rounded p-3"
                    style={{ backgroundColor: "#f8f9fa" }}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-2 flex-wrap gap-2">
                      <div>
                        <span 
                          className={`badge ${
                            feedback.type === "courses" ? "bg-primary" : "bg-success"
                          } me-2`}
                        >
                          {feedback.type === "courses" ? "On Faculty Courses" : "On Faculty Schedule"}
                        </span>
                        <span 
                          className={`badge ${
                            feedback.status === "pending" ? "bg-warning text-dark" : "bg-info"
                          }`}
                        >
                          {feedback.status === "pending" ? "Pending" : "Reviewed"}
                        </span>
                      </div>
                      <small className="text-muted">{feedback.date}</small>
                    </div>
                    <p className="mb-0" style={{ color: "#495057" }}>
                      {feedback.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}