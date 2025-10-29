import React, { useEffect, useState } from "react";
import apiClient from "../../Services/apiClient";
import { Toast, ToastContainer } from "react-bootstrap";

export default function LoadCommitteeDashboard() {
  const [publishedSchedules, setPublishedSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(null);

  // Toast state
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  useEffect(() => {
    fetchPublishedSchedules();
  }, []);

  const fetchPublishedSchedules = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/schedules');
      // Filter only published schedules that are not yet approved
      const published = response.data.filter(schedule => 
        schedule.status === 'published' && (schedule.is_approved === false || schedule.is_approved === null)
      );
      setPublishedSchedules(published);
    } catch (error) {
      console.error("Failed to fetch published schedules:", error);
      showToast("Failed to load published schedules", "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSchedule = async (scheduleId) => {
    if (!window.confirm("Are you sure you want to approve this schedule? This will make it visible to faculty members.")) {
      return;
    }

    setApproving(scheduleId);
    try {
      const response = await apiClient.patch(`/schedules/${scheduleId}/approve`);
      showToast("✅ Schedule approved successfully! Faculty members can now see their schedules.", "success");
      
      // Refresh the list
      await fetchPublishedSchedules();
    } catch (error) {
      console.error("Failed to approve schedule:", error);
      const message = error.response?.data?.error || "Failed to approve schedule";
      showToast(message, "danger");
    } finally {
      setApproving(null);
    }
  };

  return (
    <div className="container-fluid px-4" style={{ maxWidth: "1200px" }}>
      {/* Toast Container */}
      <ToastContainer position="top-end" className="p-3">
        <Toast bg={toast.type} show={toast.show} onClose={() => setToast({ show: false })}>
          <Toast.Body className="text-white">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>

      <div className="mb-4 pt-3">
        <h4 className="text-info mb-4">Load Committee Dashboard</h4>
        <p className="text-muted mb-4">Review and approve published schedules to make them visible to faculty members.</p>

        {/* Published Schedules List */}
        {loading ? (
          <div className="text-center my-5">
            <div
              className="spinner-border text-info"
              style={{ width: "3rem", height: "3rem" }}
            />
            <p className="mt-3 text-info fw-semibold">Loading published schedules...</p>
          </div>
        ) : publishedSchedules.length === 0 ? (
          <div className="bg-white rounded shadow-sm p-5 text-center">
            <h5 className="text-muted">No Published Schedules</h5>
            <p className="text-muted mb-0">Published schedules will appear here for your approval.</p>
          </div>
        ) : (
          <div className="row g-4">
            {publishedSchedules.map((schedule) => (
              <div key={schedule.id} className="col-md-6 col-lg-4">
                <div className="card h-100 shadow-sm border-0">
                  <div className="card-header bg-info text-white">
                    <h6 className="mb-0 fw-semibold">
                      Schedule #{schedule.id} - {schedule.semester}
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <span className="badge bg-warning text-dark me-2">Published</span>
                      <span className="text-muted small">
                        {new Date(schedule.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mb-3">
                      <strong>Level:</strong> {schedule.level_name}
                    </div>
                    <div className="mb-3">
                      <strong>Groups:</strong> {schedule.number_of_groups}
                    </div>
                    <div className="text-muted small">
                      Published by Committee and awaiting your approval
                    </div>
                  </div>
                  <div className="card-footer bg-transparent">
                    <button
                      className="btn btn-success w-100"
                      onClick={() => handleApproveSchedule(schedule.id)}
                      disabled={approving === schedule.id}
                    >
                      {approving === schedule.id ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Approving...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-check me-2"></i>
                          Approve Schedule
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}