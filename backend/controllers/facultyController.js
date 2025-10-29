const sql = require("../config/db");

/**
 * عرض المواد الخاصة بالأستاذ
 */
exports.getFacultyCourses = async (req, res) => {
  try {
    const { facultyId } = req.params;

    const courses = await sql`
      SELECT 
        c.course_code,
        c.course_name,
        c.type,
        c.credit_hours
      FROM course_facultys cf
      JOIN course c ON cf.course_id = c.id
      WHERE cf.faculty_id = ${facultyId};
    `;

    if (courses.length === 0) {
      return res
        .status(404)
        .json({ message: "لم يتم العثور على كورسات لهذا الأستاذ." });
    }

    res.status(200).json({
      message: "تم جلب الكورسات بنجاح ✅",
      facultyId,
      total: courses.length,
      courses,
    });
  } catch (err) {
    console.error("❌ خطأ في getFacultyCourses:", err.message);
    res
      .status(500)
      .json({ error: "حدث خطأ أثناء جلب الكورسات: " + err.message });
  }
};

/**
 * عرض السكاشن الخاصة بالأستاذ
 */
exports.getFacultySections = async (req, res) => {
  try {
    const { facultyId } = req.params;
    const sections = await sql`
      SELECT 
        s.*, 
       
        c.course_code,
        r.name AS room_name
      FROM sections s
      JOIN course c ON s.course_id = c.id
      LEFT JOIN room r ON s.room_id = r.id
      WHERE s.faculty_id = ${facultyId};
    `;
    res.json(sections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * عرض الجدول الأسبوعي للأستاذ
 */
exports.getFacultySchedule = async (req, res) => {
  try {
    const { facultyId } = req.params;

    console.log(`🔍 Fetching schedule for faculty ${facultyId}`);

    const schedule = await sql`
      SELECT 
        s.id AS section_id,
        c.course_name,
        c.course_code,
        
        c.credit_hours,
        s.day_of_week,
        TO_CHAR(s.start_time, 'HH24:MI') AS start_time,
        TO_CHAR(s.end_time, 'HH24:MI') AS end_time,
        r.name AS room_name
      FROM sections s
      JOIN course c ON s.course_id = c.id
      LEFT JOIN room r ON s.room_id = r.id
      WHERE s.faculty_id = ${facultyId};
    `;

    if (schedule.length === 0) {
      console.log(`⚠️ No schedule found for faculty ${facultyId}`);
      return res.status(404).json({ message: "لا توجد سكاشن لهذا الأستاذ." });
    }

    console.log(
      `✅ Found ${schedule.length} sections for faculty ${facultyId}`
    );
    res.status(200).json(schedule);
  } catch (err) {
    console.error("❌ Error fetching faculty schedule:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * إحصائيات الأستاذ
 */
exports.getFacultyStats = async (req, res) => {
  try {
    const { facultyId } = req.params;

    const stats = await sql`
      SELECT 
        COUNT(DISTINCT c.id) AS total_courses,
        COUNT(s.id) AS total_sections
      FROM sections s
      JOIN course c ON s.course_id = c.id
      WHERE s.faculty_id = ${facultyId};
    `;

    res.json(stats[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
