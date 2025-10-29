const sql = require("../config/db");

// عدد الطلاب
exports.getTotalStudents = async (req, res) => {
  try {
    const result = await sql`SELECT COUNT(*) AS total_students FROM student`;
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// عدد المدرسين
exports.getTotalFaculty = async (req, res) => {
  try {
    const result = await sql`SELECT COUNT(*) AS total_faculty FROM faculty`;
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// عدد المقررات
exports.getTotalCourses = async (req, res) => {
  try {
    const result = await sql`SELECT COUNT(*) AS total_courses FROM course`;
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// عدد الاستبيانات
exports.getTotalSurveys = async (req, res) => {
  try {
    const result = await sql`SELECT COUNT(*) AS total_surveys FROM survey`;
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// نسبة الطلاب المنتظمين مقابل غير المنتظمين
exports.getStudentStatusRatio = async (req, res) => {
  try {
    // Count total students
    const totalStudentsResult = await sql`
      SELECT COUNT(*) AS total_students FROM student
    `;
    const totalStudents = Number(totalStudentsResult[0].total_students);

    // Count irregular students (those appearing in irregular_students)
    const irregularResult = await sql`
      SELECT COUNT(*) AS irregular_students FROM irregular_students
    `;
    const irregularStudents = Number(irregularResult[0].irregular_students);

    // Calculate regular students
    const regularStudents = totalStudents - irregularStudents;

    // Return as consistent format [{status, total}]
    const result = [
      { status: "regular", total: regularStudents },
      { status: "irregular", total: irregularStudents },
    ];

    res.json(result);
  } catch (err) {
    console.error("❌ getStudentStatusRatio error:", err);
    res.status(500).json({ error: err.message });
  }
};


// عدد الطلاب في كل مستوى (level)
exports.getStudentsByLevel = async (req, res) => {
  try {
    const result = await sql`
      SELECT l.id AS level_id, l.name AS level_name, COUNT(s.id) AS student_count
      FROM level l
      LEFT JOIN student s ON l.id = s.level_id
      GROUP BY l.id, l.name
      ORDER BY l.id
    `;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 عدد الاستبيانات السارية والمغلقة
exports.getSurveyStatusCounts = async (req, res) => {
  try {
    const result = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE start_date <= NOW() AND end_date >= NOW()) AS active_surveys,
        COUNT(*) FILTER (WHERE end_date < NOW()) AS closed_surveys
      FROM survey
    `;
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 عدد المقررات الاختيارية والإجبارية
exports.getCourseTypesCount = async (req, res) => {
  try {
    const result = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE type = 'LECTURE') AS Core_Courses,
        COUNT(*) FILTER (WHERE type = 'ELECTIVE') AS Elective_Courses
      FROM course
    `;
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
