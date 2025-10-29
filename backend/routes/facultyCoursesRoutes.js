const express = require("express");
const {
  assignCourseToFaculty,
} = require("../controllers/facultyCoursesController");

const router = express.Router();

// POST /faculty-courses → assign course to faculty
router.post("/", assignCourseToFaculty);

module.exports = router;
