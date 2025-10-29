const express = require("express");
const router = express.Router();
const {
  getFacultyCourses,
  getFacultySections,
  addAvailability,
  getAvailability,
  deleteAvailability,
  getFacultySchedule,
  getFacultyStats,
  createSampleData,
} = require("../controllers/facultyController");

// عرض المواد الخاصة بالأستاذ
router.get("/:facultyId/courses", getFacultyCourses);

// عرض السكاشن الخاصة بالأستاذ
router.get("/:facultyId/sections", getFacultySections);



// عرض الجدول الخاص بالأستاذ
router.get("/:facultyId/schedule", getFacultySchedule);

// إحصائيات الأستاذ
router.get("/:facultyId/stats", getFacultyStats);


module.exports = router;
