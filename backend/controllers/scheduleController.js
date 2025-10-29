const sql = require("../config/db");

/**
 * 1️⃣ Generate/Create Schedule
 */
exports.createSchedule = async (req, res) => {
  try {
    const { semester, level_id, number_of_groups } = req.body;

    if (!semester || !level_id || !number_of_groups) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Create schedule record
    const result = await sql`
      INSERT INTO schedules (semester, level_id, number_of_groups, status)
      VALUES (${semester}, ${level_id}, ${number_of_groups}, 'draft')
      RETURNING *
    `;

    res.status(201).json({
      message: "Schedule created successfully",
      schedule: result[0],
    });
  } catch (err) {
    console.error("❌ Error creating schedule:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 2️⃣ Get All Schedules
 */
exports.getAllSchedules = async (req, res) => {
  try {
    const schedules = await sql`
      SELECT 
        s.id,
        s.semester,
        s.number_of_groups,
        s.status,
        s.created_at,
        s.is_approved,
        l.name AS level_name,
        l.id AS level_id
      FROM schedules s
      JOIN level l ON s.level_id = l.id
      ORDER BY s.created_at DESC
    `;

    res.json(schedules);
  } catch (err) {
    console.error("❌ Error fetching schedules:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 3️⃣ Get Schedule Details with Slots
 */
exports.getScheduleById = async (req, res) => {
  try {
    const { scheduleId } = req.params;

    // Get schedule info
    const schedule = await sql`
      SELECT 
        s.*,
        l.name AS level_name
      FROM schedules s
      JOIN level l ON s.level_id = l.id
      WHERE s.id = ${scheduleId}
    `;

    if (schedule.length === 0) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    // Get all slots for this schedule
    const slots = await sql`
      SELECT 
        ss.*,
        c.name AS course_name,
        c.code AS course_code,
        sec.type AS section_type,
        sec.day_of_week,
        sec.start_time,
        sec.end_time
      FROM schedule_slots ss
      JOIN sections sec ON ss.section_id = sec.id
      JOIN courses c ON sec.course_id = c.id
      WHERE ss.schedule_id = ${scheduleId}
      ORDER BY ss.group_number, ss.day_of_week, ss.time_slot
    `;

    res.json({
      schedule: schedule[0],
      slots: slots,
    });
  } catch (err) {
    console.error("❌ Error fetching schedule details:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 4️⃣ Add Section to Schedule Slot
 */
exports.addSlotToSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { section_id, group_number, day_of_week, time_slot } = req.body;

    // Check if section exists
   const section = await sql`SELECT * FROM simple_sections WHERE id = ${section_id}`;
if (section.length === 0) {
  return res.status(404).json({ error: "Section not found" });
}

    // Check if slot already occupied
    const existing = await sql`
      SELECT * FROM schedule_slots
      WHERE schedule_id = ${scheduleId}
        AND group_number = ${group_number}
        AND day_of_week = ${day_of_week}
        AND time_slot = ${time_slot}
    `;

    if (existing.length > 0) {
      // Update existing slot
      const updated = await sql`
        UPDATE schedule_slots
        SET section_id = ${section_id}
        WHERE id = ${existing[0].id}
        RETURNING *
      `;
      return res.json({
        message: "Slot updated successfully",
        slot: updated[0],
      });
    }

    // Insert new slot
    const result = await sql`
      INSERT INTO schedule_slots (schedule_id, section_id, group_number, day_of_week, time_slot)
      VALUES (${scheduleId}, ${section_id}, ${group_number}, ${day_of_week}, ${time_slot})
      RETURNING *
    `;

    res.status(201).json({
      message: "Slot added successfully",
      slot: result[0],
    });
  } catch (err) {
    console.error("❌ Error adding slot:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 5️⃣ Publish Schedule + Notify Students
 */
// In scheduleController.js - Update publishSchedule function

// exports.publishSchedule = async (req, res) => {
//   try {
//     const { scheduleId } = req.params;

//     // Get schedule details
//     const schedule = await sql`
//       SELECT s.*, l.name AS level_name
//       FROM schedules s
//       JOIN level l ON s.level_id = l.id
//       WHERE s.id = ${scheduleId}
//     `;

//     if (schedule.length === 0) {
//       return res.status(404).json({ error: "Schedule not found" });
//     }

//     const { level_id, semester, level_name } = schedule[0];

//     // Update schedule status to published
//  // TO THIS:
// await sql`
//   UPDATE schedules
//   SET status = 'published'
//   WHERE id = ${scheduleId}
// `;

//     // Get all students in this level
//     const students = await sql`
//       SELECT id, name, email FROM student WHERE level_id = ${level_id}
//     `;

//     // Create notification for each student
//     const notificationPromises = students.map(student =>
//       sql`
//         INSERT INTO notifications (title, description, role, user_id, status, created_at)
//         VALUES (
//           '📅 New Schedule Published',
//           ${`Your schedule for ${semester} (${level_name}) has been published. Check it now!`},
//           'student',
//           ${student.id},
//           'unread',
//           NOW()
//         )
//       `
//     );

//     await Promise.all(notificationPromises);

//     res.json({
//       message: `Schedule published successfully! ${students.length} students notified.`,
//       notified_students: students.length,
//       students: students.map(s => ({ id: s.id, name: s.name }))
//     });
//   } catch (err) {
//     console.error("❌ Error publishing schedule:", err);
//     res.status(500).json({ error: err.message });
//   }
// };

exports.publishSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;

    // Get schedule details
    const scheduleResult = await sql`
      SELECT s.*, l.name as level_name
      FROM schedules s
      JOIN level l ON s.level_id = l.id
      WHERE s.id = ${scheduleId}
    `;

    if (scheduleResult.length === 0) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    const schedule = scheduleResult[0];

    // Update schedule status to published
    await sql`
      UPDATE schedules 
      SET status = 'published'
      WHERE id = ${scheduleId}
    `;

    // Get all students in this level
    const students = await sql`
      SELECT s.id, s.name
      FROM student s
      JOIN auth a ON s.id = a.id
      WHERE s.level_id = ${schedule.level_id} 
        AND a.status = 'active'
    `;

    console.log(`📢 Creating notifications for ${students.length} students in ${schedule.level_name}`);

    // Create in-app notification for each student
    let notificationsCreated = 0;

    for (const student of students) {
      try {
        await sql`
          INSERT INTO student_notifications (
            student_id, 
            title, 
            message, 
            type, 
            link,
            created_at
          )
          VALUES (
            ${student.id},
            ${'New Schedule Published'},
            ${`Your schedule for ${schedule.level_name} - ${schedule.semester} has been published. Click to view your classes.`},
            ${'schedule'},
            ${`/student/schedule?id=${scheduleId}`},
            NOW()
          )
        `;
        notificationsCreated++;
      } catch (error) {
        console.error(`Failed to create notification for student ${student.id}:`, error);
      }
    }

    console.log(`✅ Created ${notificationsCreated} notifications`);

    res.json({
      message: `Schedule published successfully! ${notificationsCreated} students notified.`,
      schedule_id: scheduleId,
      notifications: {
        total_students: students.length,
        notifications_created: notificationsCreated
      }
    });

  } catch (err) {
    console.error("❌ Publish Schedule Error:", err);
    res.status(500).json({ error: err.message });
  }
};


// ===================== Mark Notification as Read =====================
exports.markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const studentId = req.user.id;

    const result = await sql`
      UPDATE student_notifications
      SET is_read = true
      WHERE id = ${notificationId} AND student_id = ${studentId}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ message: "Notification marked as read", notification: result[0] });

  } catch (err) {
    console.error("❌ Mark Read Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ===================== Mark All as Read =====================
exports.markAllNotificationsRead = async (req, res) => {
  try {
    const studentId = req.user.id;

    await sql`
      UPDATE student_notifications
      SET is_read = true
      WHERE student_id = ${studentId} AND is_read = false
    `;

    res.json({ message: "All notifications marked as read" });

  } catch (err) {
    console.error("❌ Mark All Read Error:", err);
    res.status(500).json({ error: err.message });
  }
};




/**
 * 6️⃣ Approve Schedule (Load Committee)
 */
exports.approveSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;

    // Get schedule details
    const scheduleResult = await sql`
      SELECT s.*, l.name as level_name
      FROM schedules s
      JOIN level l ON s.level_id = l.id
      WHERE s.id = ${scheduleId}
    `;

    if (scheduleResult.length === 0) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    const schedule = scheduleResult[0];

    // Check if schedule is published
    if (schedule.status !== 'published') {
      return res.status(400).json({ error: "Only published schedules can be approved" });
    }

    // Update schedule to mark as approved
    // Since 'approved' status may not be allowed by constraint, we'll add an is_approved field
    try {
      // First try to add the is_approved column if it doesn't exist
      await sql`
        ALTER TABLE schedules ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE
      `;
      
      // Update the schedule to mark as approved
      await sql`
        UPDATE schedules 
        SET is_approved = TRUE
        WHERE id = ${scheduleId}
      `;
      
      console.log("✅ Schedule marked as approved using is_approved field");
    } catch (error) {
      console.error("❌ Error updating schedule approval:", error);
      throw error;
    }

    // Get faculty count for reporting (optional)
    const facultyCount = await sql`
      SELECT COUNT(DISTINCT f.id) as faculty_count
      FROM faculty f
      JOIN sections s ON f.id = s.instructor_id
      JOIN schedule_slots ss ON s.id = ss.section_id
      WHERE ss.schedule_id = ${scheduleId}
    `;

    console.log(`✅ Schedule approved for ${facultyCount[0]?.faculty_count || 0} faculty members`);

    res.json({
      message: `Schedule approved successfully! Faculty members can now see their schedules.`,
      approved_schedule: {
        id: schedule.id,
        semester: schedule.semester,
        level_name: schedule.level_name,
        status: 'approved'
      },
      faculty_count: facultyCount[0]?.faculty_count || 0
    });

  } catch (err) {
    console.error("❌ Error approving schedule:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 7️⃣ Delete Schedule
 */
exports.deleteSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;

    // Delete slots first
    await sql`DELETE FROM schedule_slots WHERE schedule_id = ${scheduleId}`;

    // Delete schedule
    await sql`DELETE FROM schedules WHERE id = ${scheduleId}`;

    res.json({ message: "Schedule deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting schedule:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 7️⃣ Get Available Sections for Schedule
 */
exports.getAvailableSections = async (req, res) => {
  try {
    const { level_id } = req.query;

    if (!level_id) {
      return res.status(400).json({ error: "level_id is required" });
    }

    const sections = await sql`
      SELECT 
        s.id,
        s.day_of_week,
        s.start_time,
        s.end_time,
        s.type,
        c.name AS course_name,
        c.code AS course_code
      FROM simple_sections s
      JOIN courses c ON s.course_id = c.id
      WHERE c.level_id = ${level_id}
      ORDER BY c.code, s.day_of_week, s.start_time
    `;

    res.json(sections);
  } catch (err) {
    console.error("❌ Error fetching available sections:", err);
    res.status(500).json({ error: err.message });
  }
};