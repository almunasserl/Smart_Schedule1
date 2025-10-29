const sql = require("../config/db");

// جلب كل الاستبيانات (للمسؤول)
exports.getAllSurveys = async (req, res) => {
  try {
    const result = await sql`
      SELECT 
        s.id,
        s.title,
        s.level_id,
        l.name AS level_name,
        s.start_date,
        s.end_date,
        CASE
          WHEN s.start_date <= NOW() AND s.end_date >= NOW() THEN 'active'
          WHEN s.end_date < NOW() THEN 'closed'
          ELSE 'upcoming'
        END AS status,
        COUNT(sc.course_id) AS total_courses
      FROM survey s
      LEFT JOIN level l ON s.level_id = l.id
      LEFT JOIN survey_courses sc ON s.id = sc.survey_id
      GROUP BY s.id, s.title, s.level_id, l.name, s.start_date, s.end_date
      ORDER BY s.id ASC;
    `;

    res.json(result);
  } catch (err) {
    console.error("❌ getAllSurveys error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 1) إنشاء Survey جديد
 */
exports.createSurvey = async (req, res) => {
  try {
    const { title, level_id, start_date, end_date, course_ids } = req.body;

    // Validate input
    if (!title || !level_id)
      return res.status(400).json({ error: "Title and level_id are required" });

    // ✅ Step 1: Create survey
    const surveyResult = await sql`
      INSERT INTO survey (title, level_id, start_date, end_date)
      VALUES (${title}, ${level_id}, ${start_date}, ${end_date})
      RETURNING id, title, level_id, start_date, end_date;
    `;

    const survey = surveyResult[0];

    // ✅ Step 2: Insert related courses if provided
    if (Array.isArray(course_ids) && course_ids.length > 0) {
      const insertValues = course_ids.map(
        (courseId) => sql`(${survey.id}, ${courseId})`
      );

      await sql`
        INSERT INTO survey_courses (survey_id, course_id)
        VALUES ${sql.join(insertValues, sql`, `)};
      `;
    }

    // ✅ Step 3: Return success response
    res.status(201).json({
      message: "Survey created successfully",
      survey,
      courses_added: course_ids || [],
    });
  } catch (err) {
    console.error("❌ Error creating survey:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 2️⃣ Get all available surveys for a student
 *    - Shows active surveys for the student's level
 *    - Adds "has_voted" flag (if student already submitted)
 */
exports.getAvailableSurveys = async (req, res) => {
  try {
    const { studentId } = req.params;

    // 🔹 1. Get student's level
    const student = await sql`
      SELECT level_id FROM student WHERE id = ${studentId};
    `;
    if (student.length === 0)
      return res.status(404).json({ error: "Student not found" });

    const { level_id } = student[0];

    // 🔹 2. Get currently active surveys for that level
    const surveys = await sql`
      SELECT 
        s.id,
        s.title,
        s.level_id,
        s.start_date,
        s.end_date,
        (NOW() BETWEEN s.start_date AND s.end_date) AS is_active,
        EXISTS (
          SELECT 1 
          FROM elective_preferences ep
          WHERE ep.survey_id = s.id AND ep.student_id = ${studentId}
        ) AS has_voted
      FROM survey s
      WHERE s.level_id = ${level_id}
      ORDER BY s.start_date DESC;
    `;

    res.json(surveys);
  } catch (err) {
    console.error("❌ getAvailableSurveys error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 3️⃣ Get details of a specific survey (with its assigned courses)
 */
exports.getSurveyDetails = async (req, res) => {
  try {
    const { surveyId } = req.params;

    // 🔹 1. Fetch survey details
    const survey = await sql`
      SELECT id, title, level_id, start_date, end_date
      FROM survey
      WHERE id = ${surveyId};
    `;
    if (survey.length === 0)
      return res.status(404).json({ error: "Survey not found" });

    // 🔹 2. Fetch all courses assigned to this survey
    const courses = await sql`
      SELECT 
        c.id, 
        c.course_code, 
        c.course_name, 
        c.type, 
        c.credit_hours
      FROM survey_courses sc
      JOIN course c ON c.id = sc.course_id
      WHERE sc.survey_id = ${surveyId}
      ORDER BY c.course_code;
    `;

    res.json({
      survey: survey[0],
      courses,
    });
  } catch (err) {
    console.error("❌ getSurveyDetails error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 4️⃣ Student vote — save the student's ranked course choices
 */
exports.voteSurvey = async (req, res) => {
  try {
    const { surveyId } = req.params;
    const { student_id, first_course, second_course, third_course } = req.body;

    // 🧩 Validate input
    if (!student_id || !first_course || !second_course || !third_course) {
      return res
        .status(400)
        .json({ error: "Please select three courses to rank." });
    }

    // ✅ Prevent duplicate vote
    const existing = await sql`
      SELECT 1 FROM elective_preferences
      WHERE survey_id = ${surveyId} AND student_id = ${student_id};
    `;
    if (existing.length > 0) {
      return res
        .status(400)
        .json({ error: "You have already voted for this survey." });
    }

    // ✅ Insert 3 ranked choices
    const result = await sql`
      INSERT INTO elective_preferences (survey_id, student_id, course_id, rank, submitted_at)
      VALUES
        (${surveyId}, ${student_id}, ${first_course}, 1, NOW()),
        (${surveyId}, ${student_id}, ${second_course}, 2, NOW()),
        (${surveyId}, ${student_id}, ${third_course}, 3, NOW())
      RETURNING *;
    `;

    res.status(201).json({
      message: "✅ Vote submitted successfully!",
      votes: result,
    });
  } catch (err) {
    console.error("❌ voteSurvey error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 5️⃣ Get survey results (aggregate votes per course)
 */
exports.getSurveyResults = async (req, res) => {
  try {
    const { surveyId } = req.params;

    const results = await sql`
      SELECT 
        c.id AS course_id,
        c.course_name,
        COUNT(*) FILTER (WHERE ep.first_choice = c.id) AS first_choice_count,
        COUNT(*) FILTER (WHERE ep.second_choice = c.id) AS second_choice_count,
        COUNT(*) FILTER (WHERE ep.third_choice = c.id) AS third_choice_count,
        COUNT(*) AS total_votes
      FROM survey_courses sc
      JOIN course c ON c.id = sc.course_id
      LEFT JOIN elective_preferences ep 
        ON ep.survey_id = sc.survey_id 
        AND (ep.first_choice = c.id OR ep.second_choice = c.id OR ep.third_choice = c.id)
      WHERE sc.survey_id = ${surveyId}
      GROUP BY c.id, c.course_name
      ORDER BY first_choice_count DESC, total_votes DESC;
    `;

    res.json(results);
  } catch (err) {
    console.error("❌ getSurveyResults error:", err);
    res.status(500).json({ error: err.message });
  }
};
