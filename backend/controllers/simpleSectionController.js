const sql = require("../config/db");

// ✅ Create Section
const createSimpleSection = async (req, res) => {
  try {
    const { course_id, start_time, end_time, day_of_week, type } = req.body;

    if (!course_id || !start_time || !end_time || !day_of_week || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (start_time >= end_time) {
      return res.status(400).json({ error: "Start time must be before end time" });
    }

    const result = await sql`
      INSERT INTO simple_sections (course_id, type, start_time, end_time, day_of_week)
      VALUES (${course_id}, ${type}, ${start_time}, ${end_time}, ${day_of_week})
      RETURNING *;
    `;

    res.status(201).json(result[0]);
  } catch (err) {
    console.error("❌ Error creating section:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get All Sections
const getSimpleSections = async (req, res) => {
  try {
    const result = await sql`
      SELECT ss.*, c.code AS course_code, c.name AS course_name
      FROM simple_sections ss
      LEFT JOIN courses c ON ss.course_id = c.id
      ORDER BY ss.id DESC;
    `;
    res.json(result);
  } catch (err) {
    console.error("❌ Error fetching sections:", err);
    res.status(500).json({ error: err.message });
  }
};



// ✅ Get Section by ID
const getSimpleSectionById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await sql`
      SELECT * FROM simple_sections WHERE id = ${id};
    `;
    if (result.length === 0)
      return res.status(404).json({ error: "Section not found" });
    res.json(result[0]);
  } catch (err) {
    console.error("❌ Error fetching section:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update Section
const updateSimpleSection = async (req, res) => {
  try {
    const { id } = req.params;
    const { course_id, start_time, end_time, day_of_week, type } = req.body;

    const result = await sql`
      UPDATE simple_sections
      SET
        course_id = COALESCE(${course_id}, course_id),
        start_time = COALESCE(${start_time}, start_time),
        end_time = COALESCE(${end_time}, end_time),
        day_of_week = COALESCE(${day_of_week}, day_of_week),
        type = COALESCE(${type}, type),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *;
    `;

    if (result.length === 0)
      return res.status(404).json({ error: "Section not found" });

    res.json(result[0]);
  } catch (err) {
    console.error("❌ Error updating section:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete Section
const deleteSimpleSection = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await sql`
      DELETE FROM simple_sections WHERE id = ${id} RETURNING *;
    `;
    if (result.length === 0)
      return res.status(404).json({ error: "Section not found" });

    res.json({ message: "Section deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting section:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createSimpleSection,
  getSimpleSections,
  getSimpleSectionById,
  updateSimpleSection,
  deleteSimpleSection
};