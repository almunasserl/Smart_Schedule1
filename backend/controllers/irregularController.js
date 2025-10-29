const sql = require("../config/db");

// 🟢 Helper: Parse array safely
const parseArray = (arr) => {
  if (!arr) return [];
  if (Array.isArray(arr))
    return arr.map((item) => Number(item)).filter((item) => !isNaN(item));
  if (typeof arr === "string") {
    return arr
      .split(",")
      .filter(Boolean)
      .map(Number)
      .filter((item) => !isNaN(item));
  }
  return [];
};

// 🟢 Helper: Get course codes by array of IDs
const getCourseCodes = async (ids) => {
  const parsed = parseArray(ids);
  if (!parsed.length) return [];
  const result = await sql`SELECT course_code FROM course WHERE id = ANY(${parsed});`;
  return result.map((r) => r.course_code);
};

// 🔹 Get all irregular students
exports.getAll = async (req, res) => {
  try {
    const { level_id, search } = req.query;

    let baseQuery = sql`
      SELECT 
        i.id,
        s.id AS student_id,
        s.name AS student_name,
       
        l.name AS level_name,
        i.remaining_courses,
        i.required_courses
      FROM irregular_students i
      JOIN student s ON s.id = i.student_id
      LEFT JOIN level l ON l.id = s.level_id
      WHERE 1=1
    `;

    if (level_id) baseQuery = sql`${baseQuery} AND s.level_id = ${level_id}`;
    if (search)
      baseQuery = sql`${baseQuery} AND LOWER(s.name) LIKE LOWER('%' || ${search} || '%')`;

    baseQuery = sql`${baseQuery} ORDER BY s.name ASC;`;
    const data = await baseQuery;

    for (const row of data) {
      row.remaining_courses = await getCourseCodes(row.remaining_courses);
      row.required_courses = await getCourseCodes(row.required_courses);
    }

    res.json(data);
  } catch (err) {
    console.error("❌ Error fetching irregular students:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Get one irregular student
exports.getOne = async (req, res) => {
  try {
    const result = await sql`
      SELECT 
        i.id,
        s.id AS student_id,
        s.name AS student_name,
        l.name AS level_name,
        
        i.remaining_courses,
        i.required_courses
      FROM irregular_students i
      JOIN student s ON s.id = i.student_id
      LEFT JOIN level l ON l.id = s.level_id
      WHERE i.id = ${req.params.id}
      LIMIT 1;
    `;

    if (!result.length)
      return res.status(404).json({ error: "Irregular student not found" });

    const row = result[0];
    row.remaining_courses = await getCourseCodes(row.remaining_courses);
    row.required_courses = await getCourseCodes(row.required_courses);
    res.json(row);
  } catch (err) {
    console.error("❌ Error fetching irregular student:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Create irregular student
exports.create = async (req, res) => {
  try {
    const { student_id } = req.body;
    if (!student_id)
      return res.status(400).json({ error: "❌ student_id is required." });

    const existing = await sql`
      SELECT id FROM irregular_students WHERE student_id = ${student_id} LIMIT 1;
    `;
    if (existing.length > 0)
      return res
        .status(409)
        .json({ error: "⚠️ This student is already registered as irregular." });

    const remaining = parseArray(req.body.remaining_courses);
    const required = parseArray(req.body.required_courses);

    console.log("📦 Creating irregular student with:", {
      student_id,
      remaining_courses: remaining,
      required_courses: required,
    });

    const result = await sql`
      INSERT INTO irregular_students (student_id, remaining_courses, required_courses)
      VALUES (
        ${student_id},
        ${sql.array(remaining)}::int[],
        ${sql.array(required)}::int[]
      )
      RETURNING *;
    `;

    res.status(201).json(result[0]);
  } catch (err) {
    console.error("❌ Error creating irregular student:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Update irregular student
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const remaining = parseArray(req.body.remaining_courses);
    const required = parseArray(req.body.required_courses);

    console.log("📦 Updating irregular student:", {
      id,
      remaining_courses: remaining,
      required_courses: required,
    });

    const result = await sql`
      UPDATE irregular_students
      SET 
        remaining_courses = ${sql.array(remaining)}::int[],
        required_courses = ${sql.array(required)}::int[],
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *;
    `;

    if (!result.length)
      return res.status(404).json({ error: "Irregular student not found" });

    res.json(result[0]);
  } catch (err) {
    console.error("❌ Error updating irregular student:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Delete irregular student
exports.remove = async (req, res) => {
  try {
    await sql`DELETE FROM irregular_students WHERE id = ${req.params.id}`;
    res.json({ message: "Irregular student deleted successfully ✅" });
  } catch (err) {
    console.error("❌ Error deleting irregular student:", err);
    res.status(500).json({ error: err.message });
  }
};
