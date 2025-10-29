const sql = require("../config/db");

/**
 * 1) جلب كل الإشعارات
 */
exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await sql`
      SELECT * FROM notifications
      ORDER BY created_at DESC
    `;
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 2) جلب الإشعارات حسب الـ role
 */
exports.getNotificationsByRole = async (req, res) => {
  try {
    const { role } = req.params;

    const notifications = await sql`
      SELECT * FROM notifications
      WHERE role = ${role}
      ORDER BY created_at DESC
    `;

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 3) جلب الإشعارات الخاصة بمستخدم
 */
exports.getNotificationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const notifications = await sql`
      SELECT * FROM notifications
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 4) إضافة إشعار جديد
 */
exports.addNotification = async (req, res) => {
  try {
    const { title, description, role, user_id } = req.body;

    const result = await sql`
      INSERT INTO notifications (title, description, role, user_id, isread, created_at,status)
      VALUES (${title}, ${description}, ${role}, ${user_id}, false, NOW(), 'draft')
      RETURNING *
    `;

    res.status(201).json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 5) تحديث حالة الإشعار إلى مقروء
 */
exports.markAsPublish = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await sql`
      UPDATE notifications
      SET status = 'published'
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 6) حذف إشعار
 */
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await sql`
      DELETE FROM notifications
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ message: "Notification deleted", notification: result[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
