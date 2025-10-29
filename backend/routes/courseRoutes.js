const express = require("express");
const router = express.Router();
const {
  getCourses,
   updateCourseCapacity,
  addCourse,
  updateCourse,
  deleteCourse,
  getCourseById
} = require("../controllers/courseController");

// جلب كل الكورسات
router.get("/", getCourses);

// جلب كورس محدد
router.get("/:id", getCourseById);


// إضافة كورس
router.post("/", addCourse);

// تحديث كورس
router.patch("/:id", updateCourse);

// حذف كورس
router.delete("/:id", deleteCourse);
router.put("/:id/capacity", updateCourseCapacity);

module.exports = router;
