const express = require("express");
const router = express.Router();
const {
  createSchedule,
  getAllSchedules,
  getScheduleById,
  addSlotToSchedule,
  publishSchedule,
  approveSchedule,
  deleteSchedule,
  getAvailableSections,
   getStudentNotifications,
  markNotificationRead,
  markAllNotificationsRead
} = require("../controllers/scheduleController");

// Create schedule
router.post("/", createSchedule);

// Get all schedules
router.get("/", getAllSchedules);

// Get schedule details
router.get("/:scheduleId", getScheduleById);

// Add slot to schedule
router.post("/:scheduleId/slots", addSlotToSchedule);

// Publish schedule (notifies students)
router.patch("/:scheduleId/publish", publishSchedule);

// Approve schedule (Load Committee)
router.patch("/:scheduleId/approve", approveSchedule);

// Delete schedule
router.delete("/:scheduleId", deleteSchedule);

// Get available sections for a level
router.get("/sections/available", getAvailableSections);

module.exports = router;