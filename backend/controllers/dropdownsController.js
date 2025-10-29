const sql = require("../config/db");

exports.getCoursesList = async (req, res) => {
  try {
    const result = await sql`
      SELECT id, code
      FROM courses
      ORDER BY code ASC
    `;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * جلب الأساتذة (id + name)
 */
exports.getFacultyList = async (req, res) => {
  try {
    const result = await sql`
      SELECT id, name 
      FROM faculty
      ORDER BY name ASC
    `;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * جلب القاعات (id + "name (building - capacity)")
 */
exports.getRoomsList = async (req, res) => {
  try {
    const result = await sql`
      SELECT 
        id, 
        name || ' (' || building || ' - ' || capacity || ')' AS label
      FROM room
      ORDER BY name ASC
    `;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * جلب المستويات (id + name)
 */
exports.getLevelsList = async (req, res) => {
  try {
    const result = await sql`
      SELECT id, name
      FROM level
      ORDER BY id ASC
    `;
    res.json(result);
  } catch (err) {
    console.error("❌ Error fetching levels list:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 🧭 جلب الطلاب (id + name + university_id)
 */
exports.getStudentsList = async (req, res) => {
  try {
    const result = await sql`
      SELECT id, name
      FROM student
      ORDER BY name ASC
    `;
    res.json(result);
  } catch (err) {
    console.error("❌ Error fetching students list:", err);
    res.status(500).json({ error: err.message });
  }
};
