const express = require("express");
const router = express.Router();
const {
  createSurvey,
  getAvailableSurveys,
  getSurveyDetails,
  voteSurvey,
  getSurveyResults,
getAllSurveys
} = require("../controllers/surveyController");


router.get("/", getAllSurveys);

// إنشاء Survey جديد
router.post("/", createSurvey);

// جلب السيرفايات المتاحة للطالب
router.get("/available/:studentId", getAvailableSurveys);

// جلب تفاصيل Survey
router.get("/:surveyId", getSurveyDetails);

// تصويت الطالب
router.post("/:surveyId/vote", voteSurvey);

// عرض نتائج السيرفاي
router.get("/:surveyId/results", getSurveyResults);




module.exports = router;
