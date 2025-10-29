const sql = require("../config/db");

// 📘 Get all rules
const getAllRules = async (req, res) => {
  try {
    const rules = await sql`SELECT * FROM rules ORDER BY id ASC`;
    res.json(rules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// // 🟢 Create new rule
// const createRule = async (req, res) => {
//   try {
//     const {
//       rule_name,
//       work_start,
//       work_end,
//       working_days,
//       break_start,
//       break_end,
//       lecture_duration,
//       min_students_to_open_section
//     } = req.body;

//     // Basic validations
//     if (!work_start || !work_end || !working_days || working_days.length === 0) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     if (work_start >= work_end) {
//       return res.status(400).json({ error: "Work start time must be before work end time" });
//     }

//     if (break_start && break_end) {
//       if (break_start >= break_end) {
//         return res.status(400).json({ error: "Break start time must be before break end time" });
//       }
//       if (break_start < work_start || break_end > work_end) {
//         return res.status(400).json({ error: "Break must be within working hours" });
//       }
//     }

//     const result = await sql`
//       INSERT INTO rules (
//         rule_name,
//         work_start, 
//         work_end, 
//         working_days,
//         break_start,
//         break_end,
//         lecture_duration,
//         min_students_to_open_section
//       )
//       VALUES (
//         ${rule_name || 'Untitled Rule'},
//         ${work_start},
//         ${work_end},
//         ${working_days},
//         ${break_start || null},
//         ${break_end || null},
//         ${lecture_duration || 180},
//         ${min_students_to_open_section || 20}
//       )
//       RETURNING *
//     `;

//     res.status(201).json(result[0]);
//   } catch (err) {
//     console.error("Error creating rule:", err);
//     res.status(500).json({ error: err.message });
//   }
// };

// // 🟡 Update rule
// const updateRule = async (req, res) => {
//   const { id } = req.params;
//   const {
//     rule_name,
//     work_start,
//     work_end,
//     working_days,
//     break_start,
//     break_end,
//     lecture_duration,
//     min_students_to_open_section
//   } = req.body;

//   const safe = (val) => (val === undefined ? null : val);

//   try {
//     // Validations
//     if (work_start && work_end && work_start >= work_end) {
//       return res.status(400).json({ error: "Work start time must be before work end time" });
//     }

//     if (break_start && break_end && break_start >= break_end) {
//       return res.status(400).json({ error: "Break start time must be before break end time" });
//     }

//     if (
//       (work_start && break_start && break_start < work_start) ||
//       (work_end && break_end && break_end > work_end)
//     ) {
//       return res.status(400).json({ error: "Break must be within working hours" });
//     }

//     if (lecture_duration && (lecture_duration <= 0 || lecture_duration > 240)) {
//       return res.status(400).json({ error: "Lecture duration must be between 1 and 240 minutes" });
//     }

//     if (working_days && !Array.isArray(working_days)) {
//       return res.status(400).json({ error: "Working days must be an array" });
//     }

//     const result = await sql`
//       UPDATE rules
//       SET
//         rule_name = ${safe(rule_name)},
//         work_start = ${safe(work_start)},
//         work_end = ${safe(work_end)},
//         working_days = ${safe(working_days)},
//         break_start = ${safe(break_start)},
//         break_end = ${safe(break_end)},
//         lecture_duration = ${safe(lecture_duration)},
//         min_students_to_open_section = ${safe(min_students_to_open_section)}
//       WHERE id = ${id}
//       RETURNING *;
//     `;

//     if (result.length === 0) {
//       return res.status(404).json({ error: "Rule not found" });
//     }

//     res.json({
//       success: true,
//       message: "Rule updated successfully",
//       rule: result[0],
//     });
//   } catch (err) {
//     console.error("Error updating rule:", err);
//     res.status(500).json({ error: err.message });
//   }
// };



const BREAK_START = "12:00";
const BREAK_END = "12:50";

// Utility: compare "HH:MM" strings easily
function isBetween(time, start, end) {
  return time >= start && time < end;
}

// 🟢 Create new rule
const createRule = async (req, res) => {
  try {
    const {
      rule_name,
      work_start,
      work_end,
      working_days,
      lecture_duration,
      min_students_to_open_section
    } = req.body;

    // Basic validations
    if (!work_start || !work_end || !working_days || working_days.length === 0) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (work_start >= work_end) {
      return res.status(400).json({ error: "Work start time must be before work end time" });
    }

    // Break-time restriction removed - users can select any time

    const result = await sql`
      INSERT INTO rules (
        rule_name,
        work_start,
        work_end,
        working_days,
        break_start,
        break_end,
        lecture_duration,
        min_students_to_open_section
      )
      VALUES (
        ${rule_name || "Untitled Rule"},
        ${work_start},
        ${work_end},
        ${working_days},
        ${BREAK_START},
        ${BREAK_END},
        ${lecture_duration || 180},
        ${min_students_to_open_section || 20}
      )
      RETURNING *
    `;

    res.status(201).json(result[0]);
  } catch (err) {
    console.error("Error creating rule:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🟡 Update rule
const updateRule = async (req, res) => {
  const { id } = req.params;
  const {
    rule_name,
    work_start,
    work_end,
    working_days,
    lecture_duration,
    min_students_to_open_section
  } = req.body;

  const safe = (val) => (val === undefined ? null : val);

  try {
    if (work_start && work_end && work_start >= work_end) {
      return res.status(400).json({ error: "Work start time must be before work end time" });
    }

    // Break-time restriction removed - users can select any time

    if (lecture_duration && (lecture_duration <= 0 || lecture_duration > 240)) {
      return res.status(400).json({ error: "Lecture duration must be between 1 and 240 minutes" });
    }

    if (working_days && !Array.isArray(working_days)) {
      return res.status(400).json({ error: "Working days must be an array" });
    }

    const result = await sql`
      UPDATE rules
      SET
        rule_name = ${safe(rule_name)},
        work_start = ${safe(work_start)},
        work_end = ${safe(work_end)},
        working_days = ${safe(working_days)},
        break_start = ${BREAK_START},
        break_end = ${BREAK_END},
        lecture_duration = ${safe(lecture_duration)},
        min_students_to_open_section = ${safe(min_students_to_open_section)}
      WHERE id = ${id}
      RETURNING *;
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: "Rule not found" });
    }

    res.json({
      success: true,
      message: "Rule updated successfully",
      rule: result[0],
    });
  } catch (err) {
    console.error("Error updating rule:", err);
    res.status(500).json({ error: err.message });
  }
};


// 🔴 Delete rule
const deleteRule = async (req, res) => {
  try {
    const { id } = req.params;
    await sql`DELETE FROM rules WHERE id = ${id}`;
    res.json({ message: "Rule deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllRules,
  createRule,
  updateRule,
  deleteRule
};
