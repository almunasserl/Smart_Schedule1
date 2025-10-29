const sql = require("../config/db");

/** 🧩 تحويل الوقت إلى دقائق */
function toMinutes(timeStr) {
  const [h, m, s] = timeStr.split(":").map(Number);
  return h * 60 + m + (s ? s / 60 : 0);
}

/** 🧱 إنشاء سكشن جديد */
// exports.createSection = async (req, res) => {
//   try {
//     const {
//       course_id,
//       instructor_id,
//       room_id,
//       capacity,
//       day_of_week,
//       start_time,
//       end_time,
//     } = req.body;

//     const rules = await sql`SELECT * FROM rules LIMIT 1`;
//     if (rules.length === 0)
//       return res.status(400).json({ error: "Rules not defined" });

//     const {
//       work_start,
//       work_end,
//       break_start,
//       break_end,
//       lecture_duration,
//       min_students_to_open,
//     } = rules[0];

//     // تحقق من وقت الدوام
//     const startMin = toMinutes(start_time);
//     const endMin = toMinutes(end_time);
//     if (startMin < toMinutes(work_start) || endMin > toMinutes(work_end)) {
//       return res.status(400).json({ error: "Section outside working hours" });
//     }

//     // تحقق من وقت البريك
//     // Only check break overlap if break times are defined
// if (break_start && break_end) {
//   const overlapBreak = await sql`
//     SELECT (
//       tsrange(
//         TIMESTAMP '2000-01-01' + ${start_time}::time,
//         TIMESTAMP '2000-01-01' + ${end_time}::time
//       ) &&
//       tsrange(
//         TIMESTAMP '2000-01-01' + ${break_start}::time,
//         TIMESTAMP '2000-01-01' + ${break_end}::time
//       )
//     ) AS overlap
//   `;
//   if (overlapBreak[0].overlap)
//     return res.status(400).json({ error: "Section overlaps with break time" });
// }
//     // تحقق من مدة المحاضرة
//     const duration = await sql`
//       SELECT EXTRACT(EPOCH FROM (${end_time}::time - ${start_time}::time))/3600 AS hours
//     `;
//     if (duration[0].hours > lecture_duration)
//       return res.status(400).json({ error: "Section exceeds max duration" });

//     // تحقق من سعة القاعة
//     const room = await sql`SELECT * FROM room WHERE id = ${room_id}`;
//     if (room.length === 0)
//       return res.status(404).json({ error: "Room not found" });
//     if (capacity > room[0].capacity)
//       return res
//         .status(400)
//         .json({ error: "Section capacity exceeds room capacity" });

//     // تحقق من توفر المدرس
//     const available = await sql`
//       SELECT * FROM faculty_availability
//       WHERE faculty_id = ${instructor_id}
//         AND day = ${day_of_week}
//         AND ${start_time}::time >= start_time
//         AND ${end_time}::time <= end_time
//     `;
//     if (available.length === 0)
//       return res.status(400).json({ error: "Instructor not available" });

//     // تحقق من التعارض مع أستاذ أو قاعة
//     const conflictInstructor = await sql`
//       SELECT * FROM sections
//       WHERE instructor_id = ${instructor_id}
//         AND day_of_week = ${day_of_week}
//         AND tsrange(
//           TIMESTAMP '2000-01-01' + start_time,
//           TIMESTAMP '2000-01-01' + end_time
//         ) &&
//         tsrange(
//           TIMESTAMP '2000-01-01' + ${start_time}::time,
//           TIMESTAMP '2000-01-01' + ${end_time}::time
//         )
//     `;
//     if (conflictInstructor.length > 0)
//       return res.status(400).json({ error: "Instructor has conflict" });

//     const conflictRoom = await sql`
//       SELECT * FROM sections
//       WHERE room_id = ${room_id}
//         AND day_of_week = ${day_of_week}
//         AND tsrange(
//           TIMESTAMP '2000-01-01' + start_time,
//           TIMESTAMP '2000-01-01' + end_time
//         ) &&
//         tsrange(
//           TIMESTAMP '2000-01-01' + ${start_time}::time,
//           TIMESTAMP '2000-01-01' + ${end_time}::time
//         )
//     `;
//     if (conflictRoom.length > 0)
//       return res.status(400).json({ error: "Room already booked" });

//     // تحقق من امتلاء السكشن الأخير
//     const existing = await sql`
//       SELECT id, capacity,
//              (SELECT COUNT(*) FROM student_sections WHERE section_id = sections.id) AS enrolled
//       FROM sections WHERE course_id = ${course_id}
//     `;
//     if (existing.length > 0) {
//       const last = existing[existing.length - 1];
//       const fillRate = last.enrolled / last.capacity;
//       if (fillRate < 0.5 && last.enrolled < min_students_to_open) {
//         return res.status(400).json({
//           error: "Previous section not sufficiently filled",
//         });
//       }
//     }

//     // إدخال سكشن جديد بدون schedule_id
//     const result = await sql`
//       INSERT INTO sections (course_id, instructor_id, room_id, capacity, day_of_week, start_time, end_time)
//       VALUES (${course_id}, ${instructor_id}, ${room_id}, ${capacity}, ${day_of_week}, ${start_time}, ${end_time})
//       RETURNING *
//     `;

//     res.status(201).json(result[0]);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

exports.createSection = async (req, res) => {
  try {
    const {
      course_id,
      instructor_id,
      room_id,
      capacity,
      day_of_week,
      start_time,
      end_time,
    } = req.body;

    // 🧠 Validate required fields
    if (!course_id || !day_of_week || !start_time || !end_time) {
      return res.status(400).json({ error: "course_id, day_of_week, start_time, and end_time are required" });
    }

    // 🧩 Load current rules
    const rules = await sql`SELECT * FROM rules LIMIT 1`;
    if (rules.length === 0)
      return res.status(400).json({ error: "Rules not defined" });

    const { work_start, work_end, break_start, break_end, lecture_duration } = rules[0];

    // ✅ Check working hours (only if rule times exist)
    const startMin = toMinutes(start_time);
    const endMin = toMinutes(end_time);
    if (work_start && work_end && (startMin < toMinutes(work_start) || endMin > toMinutes(work_end))) {
      return res.status(400).json({ error: "Section outside working hours" });
    }

    // ✅ Check break overlap (only if both defined)
    if (break_start && break_end) {
      const overlapBreak = await sql`
        SELECT (
          tsrange(
            TIMESTAMP '2000-01-01' + ${start_time}::time,
            TIMESTAMP '2000-01-01' + ${end_time}::time
          ) &&
          tsrange(
            TIMESTAMP '2000-01-01' + ${break_start}::time,
            TIMESTAMP '2000-01-01' + ${break_end}::time
          )
        ) AS overlap
      `;
      if (overlapBreak[0].overlap)
        return res.status(400).json({ error: "Section overlaps with break time" });
    }

    // ✅ Check duration if rule has lecture_duration
    if (lecture_duration) {
      const duration = await sql`
        SELECT EXTRACT(EPOCH FROM (${end_time}::time - ${start_time}::time))/60 AS minutes
      `;
      if (duration[0].minutes > lecture_duration)
        return res.status(400).json({ error: "Section exceeds max duration" });
    }

    // ✅ Check room only if room_id is provided
    if (room_id) {
      const room = await sql`SELECT * FROM room WHERE id = ${room_id}`;
      if (room.length === 0)
        return res.status(404).json({ error: "Room not found" });

      if (capacity && capacity > room[0].capacity)
        return res.status(400).json({ error: "Section capacity exceeds room capacity" });
    }

    // ✅ Check instructor only if instructor_id is provided
    if (instructor_id) {
      const available = await sql`
        SELECT * FROM faculty_availability
        WHERE faculty_id = ${instructor_id}
          AND day = ${day_of_week}
          AND ${start_time}::time >= start_time
          AND ${end_time}::time <= end_time
      `;
      if (available.length === 0)
        return res.status(400).json({ error: "Instructor not available" });
    }

    // ✅ Insert new section (skip nulls safely)
    const result = await sql`
      INSERT INTO sections (
        course_id, instructor_id, room_id, capacity, day_of_week, start_time, end_time
      ) VALUES (
        ${course_id},
        ${instructor_id || null},
        ${room_id || null},
        ${capacity || null},
        ${day_of_week},
        ${start_time},
        ${end_time}
      )
      RETURNING *
    `;

    res.status(201).json(result[0]);
  } catch (err) {
    console.error("❌ Error creating section:", err);
    res.status(500).json({ error: err.message });
  }
};




/** ✏️ تحديث سكشن */
exports.updateSection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const {
      course_id,
      instructor_id,
      room_id,
      capacity,
      day_of_week,
      start_time,
      end_time,
    } = req.body;

    const room = await sql`SELECT * FROM room WHERE id = ${room_id}`;
    if (room.length === 0)
      return res.status(404).json({ error: "Room not found" });
    if (capacity > room[0].capacity)
      return res.status(400).json({ error: "Exceeds room capacity" });

    const rules = await sql`SELECT * FROM rules LIMIT 1`;

    const duration = await sql`
      SELECT EXTRACT(EPOCH FROM (${end_time}::time - ${start_time}::time))/60 AS minutes
    `;
    if (duration[0].minutes > rules[0].lecture_duration)
      return res.status(400).json({ error: "Exceeds max duration" });

    const overlapBreak = await sql`
      SELECT (
        tsrange(
          TIMESTAMP '2000-01-01' + ${start_time}::time,
          TIMESTAMP '2000-01-01' + ${end_time}::time
        ) &&
        tsrange(
          TIMESTAMP '2000-01-01' + ${rules[0].break_start}::time,
          TIMESTAMP '2000-01-01' + ${rules[0].break_end}::time
        )
      ) AS overlap
    `;
    if (overlapBreak[0].overlap)
      return res.status(400).json({ error: "Overlaps with break time" });

    const available = await sql`
      SELECT * FROM faculty_availability
      WHERE faculty_id = ${instructor_id}
        AND day = ${day_of_week}
        AND start_time <= ${start_time}::time
        AND end_time >= ${end_time}::time
    `;
    if (available.length === 0)
      return res.status(400).json({ error: "Instructor not available" });

    const conflictInstructor = await sql`
      SELECT * FROM sections
      WHERE instructor_id = ${instructor_id}
        AND day_of_week = ${day_of_week}
        AND id != ${sectionId}
        AND tsrange(
          TIMESTAMP '2000-01-01' + start_time,
          TIMESTAMP '2000-01-01' + end_time
        ) &&
        tsrange(
          TIMESTAMP '2000-01-01' + ${start_time}::time,
          TIMESTAMP '2000-01-01' + ${end_time}::time
        )
    `;
    if (conflictInstructor.length > 0)
      return res.status(400).json({ error: "Instructor conflict" });

    const conflictRoom = await sql`
      SELECT * FROM sections
      WHERE room_id = ${room_id}
        AND day_of_week = ${day_of_week}
        AND id != ${sectionId}
        AND tsrange(
          TIMESTAMP '2000-01-01' + start_time,
          TIMESTAMP '2000-01-01' + end_time
        ) &&
        tsrange(
          TIMESTAMP '2000-01-01' + ${start_time}::time,
          TIMESTAMP '2000-01-01' + ${end_time}::time
        )
    `;
    if (conflictRoom.length > 0)
      return res.status(400).json({ error: "Room conflict" });

    const updated = await sql`
      UPDATE sections
      SET course_id = ${course_id},
          instructor_id = ${instructor_id},
          room_id = ${room_id},
          capacity = ${capacity},
          day_of_week = ${day_of_week},
          start_time = ${start_time},
          end_time = ${end_time}
      WHERE id = ${sectionId}
      RETURNING *
    `;
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * جلب جميع السكشنز
 */
exports.getAllSections = async (req, res) => {
  try {
    const sections = await sql`
      SELECT 
        s.id,
        s.capacity,
        s.day_of_week,
        
        s.start_time,
        s.end_time,
        s.status,
        c.name AS course_name,
        c.code AS course_code,
        f.name AS faculty_name,
        r.name AS room_name,
        r.building,
        l.name AS level_name,
        d.name AS dept_name,
        (
          SELECT COUNT(*) FROM student_sections ss WHERE ss.section_id = s.id
        ) AS actual_students
      FROM sections s
      JOIN courses c ON s.course_id = c.id
      JOIN faculty f ON s.instructor_id = f.id
      JOIN room r ON s.room_id = r.id
      LEFT JOIN level l ON c.level_id = l.id
      LEFT JOIN departments d ON c.dept_id = d.id
      ORDER BY s.day_of_week, s.start_time
    `;

    res.json(sections);
  } catch (err) {
    console.error("❌ Error in getAllSections:", err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    await sql`DELETE FROM sections WHERE id = ${sectionId}`;
    res.json({ message: "Section deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /sections/:id/status
exports.updateSectionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["draft", "published", "approved"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const result = await sql`
      UPDATE sections
      SET status = ${status}
      WHERE id = ${id}
      RETURNING *;
    `;

    if (result.length === 0)
      return res.status(404).json({ error: "Section not found" });

    res.json({ message: "Status updated successfully", section: result[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSectionStats = async (req, res) => {
  try {
    // إجمالي كل السكاشن (sections)
    const overall = await sql`
      SELECT 
        COUNT(*) AS total_sections,
        COUNT(*) FILTER (WHERE status = 'draft') AS draft_sections,
        COUNT(*) FILTER (WHERE status = 'approved') AS approved_sections,
        COUNT(*) FILTER (WHERE status = 'published') AS published_sections
      FROM sections
    `;

    // عدد السكاشن لكل قسم
    const byDept = await sql`
      SELECT 
        d.id AS dept_id, 
        d.name AS dept_name, 
        COUNT(s.id) AS total_sections
      FROM departments d
      JOIN sections s ON d.id = s.dept_id
      GROUP BY d.id, d.name
      ORDER BY total_sections DESC
    `;

    res.json({
      overall: overall[0],
      byDepartment: byDept,
    });
  } catch (err) {
    console.error("❌ Error in getSectionStats:", err.message);
    res.status(500).json({ error: err.message });
  }
};
