const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

// Regular students
router.get("/", studentController.getAllStudents);
router.get("/level-groups/:level_id", studentController.getLevelGroups);
router.get("/sections", studentController.getSectionsByLevelAndGroup);
router.get("/schedule/default/:user_id", studentController.getStudentDefaultSchedule);


module.exports = router;
