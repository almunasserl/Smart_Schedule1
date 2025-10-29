const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

// التقارير الأساسية
router.get("/students/total", reportController.getTotalStudents);
router.get("/faculty/total", reportController.getTotalFaculty);

router.get("/courses/total", reportController.getTotalCourses);
router.get("/surveys/total", reportController.getTotalSurveys);

// تقارير تفصيلية
router.get("/students/status-ratio", reportController.getStudentStatusRatio);

router.get("/students/by-level", reportController.getStudentsByLevel);



router.get("/surveys/status", reportController.getSurveyStatusCounts);

router.get("/courses/types", reportController.getCourseTypesCount);







module.exports = router;
