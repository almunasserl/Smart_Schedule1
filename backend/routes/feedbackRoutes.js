const express = require("express");
const router = express.Router();

const {
  getAllFeedback,
  getFeedbackByUser,
  addFeedback,
  updateFeedback,
  replyToFeedback,
  deleteFeedback
} = require("../controllers/feedbackController");

/**
 * 🧾 جميع المسارات الخاصة بالتعليقات
 */

// 1️⃣ جلب كل التعليقات
router.get("/", getAllFeedback);

// 2️⃣ جلب تعليقات مستخدم معين
router.get("/user/:authId", getFeedbackByUser);

// 3️⃣ إضافة تعليق جديد
router.post("/", addFeedback);

// 4️⃣ تعديل نص التعليق
router.patch("/:feedbackId", updateFeedback);

// 5️⃣ إضافة أو تعديل الرد على التعليق (reply)
router.patch("/:feedbackId/reply", replyToFeedback);

// 6️⃣ حذف تعليق
router.delete("/:feedbackId", deleteFeedback);

module.exports = router;
