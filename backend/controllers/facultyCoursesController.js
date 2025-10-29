const sql = require("../config/db");

// Assign a course to a faculty
exports.assignCourseToFaculty = async (req, res) => {
  try {
    const { faculty_id, course_id } = req.body;

    if (!faculty_id || !course_id) {
      return res.status(400).json({ error: "faculty_id and course_id are required" });
    }

    // Check if already assigned
    const existing = await sql`
      SELECT * FROM faculty_courses 
      WHERE faculty_id = ${faculty_id} AND course_id = ${course_id}
    `;
    if (existing.length > 0) {
      return res.status(400).json({ error: "Course already assigned to this faculty" });
    }

    // Insert new assignment
    const result = await sql`
      INSERT INTO faculty_courses (faculty_id, course_id)
      VALUES (${faculty_id}, ${course_id})
      RETURNING id, faculty_id, course_id, created_at
    `;

    res.status(201).json({
      message: "✅ Course assigned to faculty successfully",
      data: result[0],
    });
  } catch (err) {
    console.error("Error assigning course:", err);
    res.status(500).json({ error: "Failed to assign course" });
  }
};
