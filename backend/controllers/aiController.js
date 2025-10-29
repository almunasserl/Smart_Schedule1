// controllers/aiController.js
const sql = require("../config/db");

/**
 * AI-Based Schedule Generation
 */
exports.generateAISchedule = async (req, res) => {
  try {
    const { schedule_id, group_number, available_sections } = req.body;

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

    // Generate time slots based on rules
    const timeSlots = generateTimeSlots(work_start, work_end);
    
    // AI Algorithm: Smart section placement
    const schedule = {};
    const usedSections = new Set();
    
    // Initialize empty schedule
    working_days.forEach(day => {
      schedule[day] = timeSlots.map(slot => ({
        time: slot,
        section_id: null,
        isBreak: isBreakTime(slot, break_start, break_end)
      }));
    });

    // Group sections by course and type
    const lectures = available_sections.filter(s => s.type === 'Lecture');
    const tutorials = available_sections.filter(s => s.type === 'Tutorial');
    const labs = available_sections.filter(s => s.type === 'Lab');

    // Priority: Lectures first, then tutorials, then labs
    const prioritizedSections = [...lectures, ...tutorials, ...labs];

    // AI Logic: Distribute sections evenly across days
    let dayIndex = 0;
    
    for (const section of prioritizedSections) {
      if (usedSections.has(section.id)) continue;

      const sectionDay = section.day_of_week;
      const sectionStartTime = section.start_time.slice(0, 5);
      const sectionEndTime = section.end_time.slice(0, 5);

      // Find matching time slot
      if (working_days.includes(sectionDay)) {
        const daySchedule = schedule[sectionDay];
        
        for (let i = 0; i < daySchedule.length; i++) {
          const slot = daySchedule[i];
          const [slotStart] = slot.time.split(' - ');

          // Check if section fits in this slot
          if (slotStart === sectionStartTime && !slot.isBreak && !slot.section_id) {
            slot.section_id = section.id;
            usedSections.add(section.id);
            
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

      dayIndex = (dayIndex + 1) % working_days.length;
    }

    res.json({
      message: "AI schedule generated successfully",
      recommendations: schedule,
      sections_placed: usedSections.size,
      total_sections: available_sections.length
    });

  } catch (err) {
    console.error("❌ AI Schedule Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Helper function to generate time slots
function generateTimeSlots(start, end) {
  const slots = [];
  let current = start;
  
  while (current < end) {
    const [hours, minutes] = current.split(':').map(Number);
    const nextHour = hours + 1;
    const next = `${String(nextHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    
    if (next <= end) {
      slots.push(`${current} - ${next}`);
    }
    current = next;
  }
  
  return slots;
}

// Helper function to check if time is break time
function isBreakTime(slot, break_start, break_end) {
  if (!break_start || !break_end) return false;
  
  const [slotStart] = slot.split(' - ');
  return slotStart >= break_start && slotStart < break_end;
}

module.exports = exports;