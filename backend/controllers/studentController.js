const sql = require("../config/db");

// 🔹 Get all students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await sql`
      SELECT 
        s.id, 
        s.name, 
        s.status,
        s.dept_id, 
        d.name AS department_name,
        s.level_id, 
        t.name AS level_name
      FROM student s
      JOIN departments d ON s.dept_id = d.id
      JOIN level t ON s.level_id = t.id
      ORDER BY s.id;
    `;
    res.json(students);
  } catch (err) {
    console.error("❌ Error fetching students:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Get all groups for a given level
exports.getLevelGroups = async (req, res) => {
  try {
    const { level_id } = req.params;
    if (!level_id)
      return res.status(400).json({ error: "level_id is required" });

    const groups = await sql`
      SELECT id, name
      FROM groups
      WHERE level_id = ${level_id}
      ORDER BY id;
    `;

    if (groups.length === 0)
      return res
        .status(404)
        .json({ message: "No groups found for this level" });

    res.json(groups);
  } catch (err) {
    console.error("❌ Error fetching level groups:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Get sections (schedule) for a given level & group
exports.getSectionsByLevelAndGroup = async (req, res) => {
  try {
    let { level_id, group_id } = req.query;
    if (!group_id)
      return res.status(400).json({ error: "group_id is required" });

    if (!level_id) {
      const group = await sql`
        SELECT level_id FROM groups WHERE id = ${group_id};
      `;
      if (group.length === 0)
        return res.status(404).json({ error: "Group not found" });

      level_id = group[0].level_id;
    }

    const sections = await sql`
      SELECT 
        s.id AS section_id,
        s.day_of_week,
        s.start_time,
        s.end_time,
        c.course_code,
        r.name AS room_name,
        f.name AS faculty_name,
        lv.name AS level_name,
        g.name AS group_name
      FROM sections s
      JOIN course c ON s.course_id = c.id
      JOIN room r ON s.room_id = r.id
      JOIN faculty f ON s.faculty_id = f.id
      JOIN level lv ON c.level_id = lv.id
      JOIN groups g ON s.section_group = g.id
      WHERE c.level_id = ${level_id}
      AND s.section_group = ${group_id}
      ORDER BY
        CASE
          WHEN s.day_of_week = 'Sunday' THEN 1
          WHEN s.day_of_week = 'Monday' THEN 2
          WHEN s.day_of_week = 'Tuesday' THEN 3
          WHEN s.day_of_week = 'Wednesday' THEN 4
          WHEN s.day_of_week = 'Thursday' THEN 5
          ELSE 6
        END,
        s.start_time;
    `;

    if (sections.length === 0)
      return res
        .status(404)
        .json({ message: "No sections found for this level and group" });

    res.json(sections);
  } catch (err) {
    console.error("❌ Error fetching sections:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Unified endpoint when student logs in (default schedule)
exports.getStudentDefaultSchedule = async (req, res) => {
  try {
    const { user_id } = req.params;
    const student = await sql`
      SELECT id AS student_id, level_id
      FROM student
      WHERE id = ${user_id};
    `;
    if (student.length === 0)
      return res.status(404).json({ error: "Student not found" });

    const { level_id } = student[0];
    const groups = await sql`
      SELECT id, name
      FROM groups
      WHERE level_id = ${level_id}
      ORDER BY id;
    `;
    if (groups.length === 0)
      return res
        .status(404)
        .json({ message: "No groups found for this level" });

    const firstGroup = groups[0];
    const sections = await sql`
      SELECT 
        s.id AS section_id,
        s.day_of_week,
        s.start_time,
        s.end_time,
        c.course_code,
        r.name AS room_name,
        f.name AS faculty_name,
        lv.name AS level_name,
        g.name AS group_name
      FROM sections s
      JOIN course c ON s.course_id = c.id
      JOIN room r ON s.room_id = r.id
      JOIN faculty f ON s.faculty_id = f.id
      JOIN level lv ON c.level_id = lv.id
      JOIN groups g ON s.section_group = g.id
      WHERE c.level_id = ${level_id}
      AND s.section_group = ${firstGroup.id}
      ORDER BY
        CASE
          WHEN s.day_of_week = 'Sunday' THEN 1
          WHEN s.day_of_week = 'Monday' THEN 2
          WHEN s.day_of_week = 'Tuesday' THEN 3
          WHEN s.day_of_week = 'Wednesday' THEN 4
          WHEN s.day_of_week = 'Thursday' THEN 5
          ELSE 6
        END,
        s.start_time;
    `;

    res.json({
      student_id: student[0].student_id,
      level_id,
      selected_group: firstGroup,
      groups,
      schedule: sections,
    });
  } catch (err) {
    console.error("❌ Error fetching student default schedule:", err);
    res.status(500).json({ error: err.message });
  }
};
