const express = require("express");
const router = express.Router();
const {
  getAllNotifications,
  getNotificationsByRole,
  getNotificationsByUser,
  addNotification,
  markAsPublish,
  deleteNotification
} = require("../controllers/notificationController");

// كل الإشعارات
router.get("/", getAllNotifications);

// إشعارات حسب الـ role
router.get("/role/:role", getNotificationsByRole);

// إشعارات مستخدم
router.get("/user/:userId", getNotificationsByUser);

// إضافة إشعار
router.post("/", addNotification);

// تحديث حالة (مقروء)
router.patch("/:id/publish", markAsPublish);

// حذف إشعار
router.delete("/:id", deleteNotification);

module.exports = router;
