// const sql = require("../config/db");
// const openai = require("../config/openai");

// exports.generateSmartSections = async (req, res) => {
//   try {
//     // 🔹 اجمع كل البيانات اللازمة من قاعدة البيانات
//     const [
//       courses,
//       facultyCourses,
//       facultyAvailability,
//       prevSections,
//       rules,
//       faculty,
//       rooms,
//     ] = await Promise.all([
//       sql`SELECT id, code, name, level_id, dept_id, credit_hours FROM courses`,
//       sql`SELECT course_id, faculty_id FROM faculty_courses`,
//       sql`SELECT faculty_id, day, start_time, end_time FROM faculty_availability`,
//       sql`SELECT id, course_id, instructor_id, room_id, day_of_week, start_time, end_time FROM sections`,
//       sql`SELECT * FROM rules LIMIT 1`,
//       sql`SELECT id, name FROM faculty`,
//       sql`SELECT id, name FROM room`,
//     ]);

//     const r = rules[0];
//     const hasAvailability = facultyAvailability.length > 0;

//     // 🔸 بناء النص الكامل المرسل إلى الذكاء الاصطناعي
//     const context = `
// You are an advanced university scheduling assistant.

// ${
//   !hasAvailability
//     ? "⚠️ NOTE: No faculty availability data is provided. You may suggest times logically within working hours (8:00–16:00) while ensuring no overlaps."
//     : ""
// }

// Your goal is to generate new course sections (classes) for the next semester
// while respecting all academic rules, instructor availability, and existing schedule constraints.

// ---

// 📘 COURSES:
// ${courses
//   .map(
//     (c) =>
//       `${c.id}: ${c.code} - ${c.name} (Level ${c.level_id}, Dept ${c.dept_id}, Credit hours ${c.credit_hours})`
//   )
//   .join("\n")}

// 👨‍🏫 FACULTY LIST:
// ${faculty.map((f) => `${f.id}: ${f.name}`).join("\n")}

// 🏫 ROOMS:
// ${rooms.map((r) => `${r.id}: ${r.name}`).join("\n")}

// 📚 FACULTY COURSES (who can teach what):
// ${facultyCourses
//   .map(
//     (fc) => `Course ${fc.course_id} can be taught by Faculty ${fc.faculty_id}`
//   )
//   .join("\n")}

// 📅 FACULTY AVAILABILITY:
// ${facultyAvailability
//   .map(
//     (fa) =>
//       `Faculty ${fa.faculty_id}: available on ${fa.day} from ${fa.start_time} to ${fa.end_time}`
//   )
//   .join("\n")}

// ⚠️ EXISTING SECTIONS (avoid conflicts with these):
// ${prevSections
//   .map(
//     (s) =>
//       `Course ${s.course_id} taught by Faculty ${s.instructor_id} in Room ${s.room_id} on ${s.day_of_week} from ${s.start_time} to ${s.end_time}`
//   )
//   .join("\n")}

// 🧩 RULES:
// - Working hours: ${r.work_start} to ${r.work_end}
// - Working days: ${r.working_days.join(", ")}
// - Break time: ${r.break_start} to ${r.break_end}
// - Max lecture duration: ${r.lecture_duration} minutes
// - Minimum students to open section: ${r.min_students_to_open_section}

// ---

// 🎯 TASK:
// Generate a JSON array of 5–10 NEW SECTIONS following these rules:
// Each object should contain:
// - course_id
// - course_code
// - instructor_id
// - faculty_name
// - room_id
// - room_name
// - day_of_week
// - start_time
// - end_time
// - capacity
// - status = "draft"

// Important:
// - Avoid time conflicts with existing sections.
// - Respect each faculty’s availability.
// - Spread sections across available days.
// - Avoid assigning the same instructor twice at overlapping times.
// - Keep your response in pure JSON format only.
// `;

//     // 🔹 طلب من GPT يولّد السكاشن
//     const response = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [
//         {
//           role: "system",
//           content:
//             "You are a university scheduling assistant. Respond ONLY with valid JSON.",
//         },
//         { role: "user", content: context },
//       ],
//       temperature: 0.7,
//     });

//     const raw = response.choices[0].message.content;

//     let sections = [];
//     try {
//       // 🧹 تنظيف النص من أي Markdown قبل التحليل
//       const cleaned = raw
//         .replace(/```json/i, "")
//         .replace(/```/g, "")
//         .trim();
//       sections = JSON.parse(cleaned);
//     } catch (err) {
//       console.error("❌ JSON parse failed:", err);
//       return res.status(500).json({
//         error: "AI returned invalid JSON format",
//         raw,
//       });
//     }

//     // ✅ إرسال الرد بصيغة JSON منسّقة وواضحة
//     res.setHeader("Content-Type", "application/json");
//     res.send(JSON.stringify(sections, null, 2));
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// };


// // Helper function to generate time slots
// exports.generateTimeSlots=(start, end)=> {
//   const slots = [];
//   let current = start;
  
//   while (current < end) {
//     const [hours, minutes] = current.split(':').map(Number);
//     const nextHour = hours + 1;
//     const next = `${String(nextHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    
//     if (next <= end) {
//       slots.push(`${current} - ${next}`);
//     }
//     current = next;
//   }
  
//   return slots;
// }

// // Helper function to check if time is break time
// exports.isBreakTime=(slot, break_start, break_end) =>{
//   if (!break_start || !break_end) return false;
  
//   const [slotStart] = slot.split(' - ');
//   return slotStart >= break_start && slotStart < break_end;}

// exports.generateAISchedule = async (req, res) => {
//   try {
//     const { schedule_id, group_number, available_sections } = req.body;

//     if (!schedule_id || !group_number || !available_sections) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     // Get rules
//     const rules = await sql`SELECT * FROM rules LIMIT 1`;
//     if (rules.length === 0) {
//       return res.status(400).json({ error: "No scheduling rules found" });
//     }

//     const rule = rules[0];
//     const { work_start, work_end, working_days, break_start, break_end } = rule;

//     // Generate time slots based on rules
//     const timeSlots = generateTimeSlots(work_start, work_end);
    
//     // AI Algorithm: Smart section placement
//     const schedule = {};
//     const usedSections = new Set();
    
//     // Initialize empty schedule
//     working_days.forEach(day => {
//       schedule[day] = timeSlots.map(slot => ({
//         time: slot,
//         section_id: null,
//         isBreak: isBreakTime(slot, break_start, break_end)
//       }));
//     });

//     // Group sections by course and type
//     const lectures = available_sections.filter(s => s.type === 'Lecture');
//     const tutorials = available_sections.filter(s => s.type === 'Tutorial');
//     const labs = available_sections.filter(s => s.type === 'Lab');

//     // Priority: Lectures first, then tutorials, then labs
//     const prioritizedSections = [...lectures, ...tutorials, ...labs];

//     // AI Logic: Distribute sections evenly across days
//     let dayIndex = 0;
    
//     for (const section of prioritizedSections) {
//       if (usedSections.has(section.id)) continue;

//       const sectionDay = section.day_of_week;
//       const sectionStartTime = section.start_time.slice(0, 5);
//       const sectionEndTime = section.end_time.slice(0, 5);

//       // Find matching time slot
//       if (working_days.includes(sectionDay)) {
//         const daySchedule = schedule[sectionDay];
        
//         for (let i = 0; i < daySchedule.length; i++) {
//           const slot = daySchedule[i];
//           const [slotStart] = slot.time.split(' - ');

//           // Check if section fits in this slot
//           if (slotStart === sectionStartTime && !slot.isBreak && !slot.section_id) {
//             slot.section_id = section.id;
//             usedSections.add(section.id);
            
//             // Save to database
//             await sql`
//               INSERT INTO schedule_slots (schedule_id, section_id, group_number, day_of_week, time_slot)
//               VALUES (${schedule_id}, ${section.id}, ${group_number}, ${sectionDay}, ${slot.time})
//               ON CONFLICT (schedule_id, group_number, day_of_week, time_slot) 
//               DO UPDATE SET section_id = ${section.id}
//             `;
//             break;
//           }
//         }
//       }

//       dayIndex = (dayIndex + 1) % working_days.length;
//     }

//     res.json({
//       message: "AI schedule generated successfully",
//       recommendations: schedule,
//       sections_placed: usedSections.size,
//       total_sections: available_sections.length
//     });

//   } catch (err) {
//     console.error("❌ AI Schedule Error:", err);
//     res.status(500).json({ error: err.message });
//   }
// };



// const sql = require("../config/db");
// const openai = require("../config/openai");

// // 🔹 Helper function to generate time slots
// function generateTimeSlots(start, end) {
//   const slots = [];
//   let current = start;

//   while (current < end) {
//     const [hours, minutes] = current.split(":").map(Number);
//     const nextHour = hours + 1;
//     const next = `${String(nextHour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

//     if (next <= end) {
//       slots.push(`${current} - ${next}`);
//     }

//     current = next;
//   }

//   return slots;
// }

// // 🔹 Helper function to check if a slot is during break
// function isBreakTime(slot, break_start, break_end) {
//   if (!break_start || !break_end) return false;
//   const [slotStart] = slot.split(" - ");
//   return slotStart >= break_start && slotStart < break_end;
// }

// // ===================== AI Schedule Generation =====================
// exports.generateAISchedule = async (req, res) => {
//   try {
//     const { schedule_id, group_number, available_sections } = req.body;

//     if (!schedule_id || !group_number || !available_sections) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     // Get rules
//     const rules = await sql`SELECT * FROM rules LIMIT 1`;
//     if (rules.length === 0) {
//       return res.status(400).json({ error: "No scheduling rules found" });
//     }

//     const rule = rules[0];
//     const { work_start, work_end, working_days, break_start, break_end } = rule;

//     // Generate time slots
//     const timeSlots = generateTimeSlots(work_start, work_end);

//     // Initialize empty schedule
//     const schedule = {};
//     const usedSections = new Set();
//     working_days.forEach(day => {
//       schedule[day] = timeSlots.map(slot => ({
//         time: slot,
//         section_id: null,
//         isBreak: isBreakTime(slot, break_start, break_end),
//       }));
//     });

//     // Group sections by type
//     const lectures = available_sections.filter(s => s.type === "Lecture");
//     const tutorials = available_sections.filter(s => s.type === "Tutorial");
//     const labs = available_sections.filter(s => s.type === "Lab");
//     const prioritizedSections = [...lectures, ...tutorials, ...labs];

//     // Place sections into schedule
//     for (const section of prioritizedSections) {
//       if (usedSections.has(section.id)) continue;

//       const sectionDay = section.day_of_week;
//       const sectionStartTime = section.start_time.slice(0, 5);

//       if (working_days.includes(sectionDay)) {
//         const daySchedule = schedule[sectionDay];

//         for (let i = 0; i < daySchedule.length; i++) {
//           const slot = daySchedule[i];
//           const [slotStart] = slot.time.split(" - ");

//           if (slotStart === sectionStartTime && !slot.isBreak && !slot.section_id) {
//             slot.section_id = section.id;
//             usedSections.add(section.id);

//             // Save to database
//             await sql`
//               INSERT INTO schedule_slots (schedule_id, section_id, group_number, day_of_week, time_slot)
//               VALUES (${schedule_id}, ${section.id}, ${group_number}, ${sectionDay}, ${slot.time})
//               ON CONFLICT (schedule_id, group_number, day_of_week, time_slot)
//               DO UPDATE SET section_id = ${section.id}
//             `;
//             break;
//           }
//         }
//       }
//     }

//     res.json({
//       message: "AI schedule generated successfully",
//       recommendations: schedule,
//       sections_placed: usedSections.size,
//       total_sections: available_sections.length,
//     });

//   } catch (err) {
//     console.error("❌ AI Schedule Error:", err);
//     res.status(500).json({ error: err.message });
//   }
// };

// // ===================== Smart Sections via OpenAI =====================
// exports.generateSmartSections = async (req, res) => {
//   try {
//     const [
//       courses,
//       facultyCourses,
//       facultyAvailability,
//       prevSections,
//       rules,
//       faculty,
//       rooms,
//     ] = await Promise.all([
//       sql`SELECT id, code, name, level_id, dept_id, credit_hours FROM courses`,
//       sql`SELECT course_id, faculty_id FROM faculty_courses`,
//       sql`SELECT faculty_id, day, start_time, end_time FROM faculty_availability`,
//       sql`SELECT id, course_id, instructor_id, room_id, day_of_week, start_time, end_time FROM sections`,
//       sql`SELECT * FROM rules LIMIT 1`,
//       sql`SELECT id, name FROM faculty`,
//       sql`SELECT id, name FROM room`,
//     ]);

//     const r = rules[0];
//     const hasAvailability = facultyAvailability.length > 0;

//     const context = `
// You are an advanced university scheduling assistant.

// ${
//   !hasAvailability
//     ? "⚠️ NOTE: No faculty availability data is provided. Suggest times logically within working hours (8:00–16:00) without overlaps."
//     : ""
// }

// Your goal is to generate new course sections (classes) for the next semester while respecting all academic rules, instructor availability, and existing schedule constraints.

// ---  

// 📘 COURSES:
// ${courses.map(c => `${c.id}: ${c.code} - ${c.name} (Level ${c.level_id}, Dept ${c.dept_id}, Credit hours ${c.credit_hours})`).join("\n")}

// 👨‍🏫 FACULTY LIST:
// ${faculty.map(f => `${f.id}: ${f.name}`).join("\n")}

// 🏫 ROOMS:
// ${rooms.map(r => `${r.id}: ${r.name}`).join("\n")}

// 📚 FACULTY COURSES (who can teach what):
// ${facultyCourses.map(fc => `Course ${fc.course_id} can be taught by Faculty ${fc.faculty_id}`).join("\n")}

// 📅 FACULTY AVAILABILITY:
// ${facultyAvailability.map(fa => `Faculty ${fa.faculty_id}: available on ${fa.day} from ${fa.start_time} to ${fa.end_time}`).join("\n")}

// ⚠️ EXISTING SECTIONS (avoid conflicts):
// ${prevSections.map(s => `Course ${s.course_id} taught by Faculty ${s.instructor_id} in Room ${s.room_id} on ${s.day_of_week} from ${s.start_time} to ${s.end_time}`).join("\n")}

// 🧩 RULES:
// - Working hours: ${r.work_start} to ${r.work_end}
// - Working days: ${r.working_days.join(", ")}
// - Break time: ${r.break_start} to ${r.break_end}
// - Max lecture duration: ${r.lecture_duration} minutes
// - Minimum students to open section: ${r.min_students_to_open_section}

// ---  

// 🎯 TASK:
// Generate a JSON array of 5–10 NEW SECTIONS following these rules:
// Each object should contain:
// - course_id, course_code, instructor_id, faculty_name, room_id, room_name, day_of_week, start_time, end_time, capacity, status="draft"
// - Avoid conflicts with existing sections.
// - Respect faculty availability.
// - Spread sections across available days.
// - Respond ONLY in pure JSON.
// `;

//     const response = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [
//         { role: "system", content: "You are a university scheduling assistant. Respond ONLY with valid JSON." },
//         { role: "user", content: context },
//       ],
//       temperature: 0.7,
//     });

//     const raw = response.choices[0].message.content;

//     let sections = [];
//     try {
//       const cleaned = raw.replace(/```json/i, "").replace(/```/g, "").trim();
//       sections = JSON.parse(cleaned);
//     } catch (err) {
//       console.error("❌ JSON parse failed:", err);
//       return res.status(500).json({ error: "AI returned invalid JSON", raw });
//     }

//     res.setHeader("Content-Type", "application/json");
//     res.send(JSON.stringify(sections, null, 2));

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// };


const sql = require("../config/db");
const openai = require("../config/openai");

// 🔹 Helper function to generate time slots
function generateTimeSlots(start, end) {
  const slots = [];
  let current = start;

  while (current < end) {
    const [hours, minutes] = current.split(":").map(Number);
    const nextHour = hours + 1;
    const next = `${String(nextHour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

    if (next <= end) {
      slots.push(`${current} - ${next}`);
    }

    current = next;
  }

  return slots;
}

// 🔹 Helper function to check if a slot is during break
function isBreakTime(slot, break_start, break_end) {
  if (!break_start || !break_end) return false;
  const [slotStart] = slot.split(" - ");
  return slotStart >= break_start && slotStart < break_end;
}

// 🔹 Helper function to check if a time falls within a time slot
function timeInSlot(time, slot) {
  const [slotStart, slotEnd] = slot.split(" - ");
  const timeHour = time.split(":")[0];
  const slotStartHour = slotStart.split(":")[0];
  return timeHour === slotStartHour;
}

// ===================== AI Schedule Generation =====================
exports.generateAISchedule = async (req, res) => {
  try {
    const { schedule_id, group_number, available_sections } = req.body;

    console.log("📥 Received AI request:", { schedule_id, group_number, sections: available_sections.length });

    if (!schedule_id || !group_number || !available_sections) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get rules
    const rules = await sql`SELECT * FROM rules LIMIT 1`;
    if (rules.length === 0) {
      return res.status(400).json({ error: "No scheduling rules found" });
    }

    const rule = rules[0];
    const { work_start, work_end, working_days, break_start, break_end } = rule;

    console.log("📋 Rules:", { work_start, work_end, working_days });

    // Generate time slots
    const timeSlots = generateTimeSlots(work_start, work_end);
    console.log("⏰ Generated time slots:", timeSlots);

    // Initialize empty schedule
    const schedule = {};
    const usedSections = new Set();
    working_days.forEach(day => {
      schedule[day] = timeSlots.map(slot => ({
        time: slot,
        section_id: null,
        isBreak: isBreakTime(slot, break_start, break_end),
      }));
    });

    // Group sections by type (prioritize lectures, then tutorials, then labs)
    const lectures = available_sections.filter(s => s.type === "Lecture");
    const tutorials = available_sections.filter(s => s.type === "Tutorial");
    const labs = available_sections.filter(s => s.type === "Lab");
    const prioritizedSections = [...lectures, ...tutorials, ...labs];

    console.log("📚 Sections by type:", { 
      lectures: lectures.length, 
      tutorials: tutorials.length, 
      labs: labs.length 
    });

    // Place sections into schedule
    for (const section of prioritizedSections) {
      if (usedSections.has(section.id)) continue;

      const sectionDay = section.day_of_week;
      const sectionStartTime = section.start_time.slice(0, 5); // "08:33:00" -> "08:33"

      console.log(`🔍 Processing section ${section.id}: ${section.course_code} on ${sectionDay} at ${sectionStartTime}`);

      if (working_days.includes(sectionDay)) {
        const daySchedule = schedule[sectionDay];

        for (let i = 0; i < daySchedule.length; i++) {
          const slot = daySchedule[i];

          // Check if section's start time falls within this slot's hour
          if (timeInSlot(sectionStartTime, slot.time) && !slot.isBreak && !slot.section_id) {
            slot.section_id = section.id;
            usedSections.add(section.id);

            console.log(`✅ Placed section ${section.id} in slot ${slot.time} on ${sectionDay}`);

            // Save to database
            await sql`
              INSERT INTO schedule_slots (schedule_id, section_id, group_number, day_of_week, time_slot)
              VALUES (${schedule_id}, ${section.id}, ${group_number}, ${sectionDay}, ${slot.time})
              ON CONFLICT (schedule_id, group_number, day_of_week, time_slot)
              DO UPDATE SET section_id = ${section.id}
            `;
            break;
          }
        }
      }
    }

    console.log(`🎯 Placed ${usedSections.size} out of ${available_sections.length} sections`);

    res.json({
      message: "AI schedule generated successfully",
      recommendations: schedule,
      sections_placed: usedSections.size,
      total_sections: available_sections.length,
    });

  } catch (err) {
    console.error("❌ AI Schedule Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ===================== Smart Sections via OpenAI =====================
exports.generateSmartSections = async (req, res) => {
  try {
    const [
      courses,
      facultyCourses,
      facultyAvailability,
      prevSections,
      rules,
      faculty,
      rooms,
    ] = await Promise.all([
      sql`SELECT id, code, name, level_id, dept_id, credit_hours FROM courses`,
      sql`SELECT course_id, faculty_id FROM faculty_courses`,
      sql`SELECT faculty_id, day, start_time, end_time FROM faculty_availability`,
      sql`SELECT id, course_id, instructor_id, room_id, day_of_week, start_time, end_time FROM sections`,
      sql`SELECT * FROM rules LIMIT 1`,
      sql`SELECT id, name FROM faculty`,
      sql`SELECT id, name FROM room`,
    ]);

    const r = rules[0];
    const hasAvailability = facultyAvailability.length > 0;

    const context = `
You are an advanced university scheduling assistant.

${
  !hasAvailability
    ? "⚠️ NOTE: No faculty availability data is provided. Suggest times logically within working hours (8:00–16:00) without overlaps."
    : ""
}

Your goal is to generate new course sections (classes) for the next semester while respecting all academic rules, instructor availability, and existing schedule constraints.

---  

📘 COURSES:
${courses.map(c => `${c.id}: ${c.code} - ${c.name} (Level ${c.level_id}, Dept ${c.dept_id}, Credit hours ${c.credit_hours})`).join("\n")}

👨‍🏫 FACULTY LIST:
${faculty.map(f => `${f.id}: ${f.name}`).join("\n")}

🏫 ROOMS:
${rooms.map(r => `${r.id}: ${r.name}`).join("\n")}

📚 FACULTY COURSES (who can teach what):
${facultyCourses.map(fc => `Course ${fc.course_id} can be taught by Faculty ${fc.faculty_id}`).join("\n")}

📅 FACULTY AVAILABILITY:
${facultyAvailability.map(fa => `Faculty ${fa.faculty_id}: available on ${fa.day} from ${fa.start_time} to ${fa.end_time}`).join("\n")}

⚠️ EXISTING SECTIONS (avoid conflicts):
${prevSections.map(s => `Course ${s.course_id} taught by Faculty ${s.instructor_id} in Room ${s.room_id} on ${s.day_of_week} from ${s.start_time} to ${s.end_time}`).join("\n")}

🧩 RULES:
- Working hours: ${r.work_start} to ${r.work_end}
- Working days: ${r.working_days.join(", ")}
- Break time: ${r.break_start} to ${r.break_end}
- Max lecture duration: ${r.lecture_duration} minutes
- Minimum students to open section: ${r.min_students_to_open_section}

---  

🎯 TASK:
Generate a JSON array of 5–10 NEW SECTIONS following these rules:
Each object should contain:
- course_id, course_code, instructor_id, faculty_name, room_id, room_name, day_of_week, start_time, end_time, capacity, status="draft"
- Avoid conflicts with existing sections.
- Respect faculty availability.
- Spread sections across available days.
- Respond ONLY in pure JSON.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a university scheduling assistant. Respond ONLY with valid JSON." },
        { role: "user", content: context },
      ],
      temperature: 0.7,
    });

    const raw = response.choices[0].message.content;

    let sections = [];
    try {
      const cleaned = raw.replace(/```json/i, "").replace(/```/g, "").trim();
      sections = JSON.parse(cleaned);
    } catch (err) {
      console.error("❌ JSON parse failed:", err);
      return res.status(500).json({ error: "AI returned invalid JSON", raw });
    }

    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(sections, null, 2));

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};