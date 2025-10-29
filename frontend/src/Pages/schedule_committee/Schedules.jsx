
// import React, { useState, useEffect } from "react";
// import { Sparkles } from "lucide-react";
// import apiClient from "../../Services/apiClient";

// export default function CreateSchedule() {
//   const [schedules, setSchedules] = useState([]);
//   const [levels, setLevels] = useState([]);
//   const [showForm, setShowForm] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [aiLoading, setAiLoading] = useState(false);
//   const [generatedSchedules, setGeneratedSchedules] = useState([]);
//   const [availableSections, setAvailableSections] = useState([]);

//   const [formData, setFormData] = useState({
//     semester: "",
//     level_id: "",
//     number_of_groups: ""
//   });

//   const [toast, setToast] = useState({ show: false, message: "", type: "" });
//   const showToast = (message, type = "info") => {
//     setToast({ show: true, message, type });
//     setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
//   };

//   const semesters = ["Semester 1", "Semester 2"];
//   const groupOptions = ["1", "2", "3"];
//   const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

//   const timeSlots = [
//     "08:00 - 09:00",
//     "09:00 - 10:00",
//     "10:00 - 11:00",
//     "11:00 - 12:00",
//     "12:00 - 13:00",
//     "13:00 - 14:00",
//     "14:00 - 15:00"
//   ];

//   useEffect(() => {
//     fetchLevels();
//     fetchSchedules();
//   }, []);

//   const fetchLevels = async () => {
//     try {
//       const response = await apiClient.get("/dropdowns/terms");
//       setLevels(response.data || []);
//     } catch (error) {
//       console.error("Failed to fetch levels:", error);
//     }
//   };

//   const fetchSchedules = async () => {
//     try {
//       const response = await apiClient.get("/schedules");
//       setSchedules(response.data || []);
//     } catch (error) {
//       console.error("Failed to fetch schedules:", error);
//     }
//   };

//   const fetchAvailableSections = async (level_id) => {
//     try {
//       const response = await apiClient.get(`/simple-sections`);
//       // Filter sections by level
//       setAvailableSections(response.data || []);
//     } catch (error) {
//       console.error("Failed to fetch sections:", error);
//     }
//   };

// // const fetchAvailableSections = async (level_id) => {
// //   try {
// //     const response = await apiClient.get(`/simple-sections`);
// //     // Filter by level_id from courses table
// //     const filteredSections = response.data.filter(
// //       (section) => section.level_id === parseInt(level_id)
// //     );
// //     setAvailableSections(filteredSections || []);
// //   } catch (error) {
// //     console.error("Failed to fetch sections:", error);
// //   }
// // };




//   const handleGenerateSchedule = async () => {
//     if (!formData.semester || !formData.level_id || !formData.number_of_groups) {
//       showToast("Please fill all fields", "warning");
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await apiClient.post("/schedules", {
//         semester: formData.semester,
//         level_id: parseInt(formData.level_id),
//         number_of_groups: parseInt(formData.number_of_groups)
//       });

//       const newSchedule = response.data.schedule;
//       await fetchAvailableSections(formData.level_id);

//       const numGroups = parseInt(formData.number_of_groups);
//       const levelName = levels.find(l => l.id === parseInt(formData.level_id))?.name || "";

//       const newSchedules = [];
//       for (let i = 1; i <= numGroups; i++) {
//         newSchedules.push({
//           id: newSchedule.id,
//           semester: formData.semester,
//           level: levelName,
//           group: i,
//           schedule: generateEmptySchedule()
//         });
//       }

//       setGeneratedSchedules(newSchedules);
//       showToast(`✅ ${numGroups} schedule(s) generated successfully!`, "success");
//       setShowForm(false);
//       fetchSchedules();
//     } catch (error) {
//       showToast("Error generating schedule: " + (error.response?.data?.error || error.message), "danger");
//       console.error("Failed to generate schedule:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // const handleAIRecommendation = async (scheduleData) => {
//   //   setAiLoading(true);
//   //   try {
//   //     showToast("🤖 AI is analyzing and generating optimal schedule...", "info");
      
//   //     const response = await apiClient.post(`/ai/generate-schedule`, {
//   //       schedule_id: scheduleData.id,
//   //       group_number: scheduleData.group,
//   //       available_sections: availableSections
//   //     });

//   //     if (response.data && response.data.recommendations) {
//   //       // Apply AI recommendations to the schedule
//   //       const aiSchedule = response.data.recommendations;
        
//   //       setGeneratedSchedules(prev =>
//   //         prev.map(schedule => {
//   //           if (schedule.id === scheduleData.id && schedule.group === scheduleData.group) {
//   //             return {
//   //               ...schedule,
//   //               schedule: aiSchedule
//   //             };
//   //           }
//   //           return schedule;
//   //         })
//   //       );

//   //       showToast("✅ AI recommendations applied successfully!", "success");
//   //     }
//   //   } catch (error) {
//   //     showToast("AI recommendation failed: " + (error.response?.data?.error || error.message), "danger");
//   //     console.error("AI recommendation error:", error);
//   //   } finally {
//   //     setAiLoading(false);
//   //   }
//   // };


// const handleAIRecommendation = async (scheduleData) => {
//   setAiLoading(true);
//   try {
//     showToast("🤖 AI is analyzing and generating optimal schedule...", "info");

//     const response = await apiClient.post(`/ai/generate-schedule`, {
//       schedule_id: scheduleData.id,
//       group_number: scheduleData.group,
//       available_sections: availableSections
//     });
    
//     console.log("AI Recommendations:", response.data.recommendations);
//     console.log("Available Sections:", availableSections);

//     if (response.data && response.data.recommendations) {
//       const aiRaw = response.data.recommendations;

//       // Check if AI actually provided any sections
//       let hasValidSections = false;
//       Object.values(aiRaw).forEach(daySlots => {
//         if (Array.isArray(daySlots)) {
//           daySlots.forEach(slot => {
//             if (slot.section_id !== null && slot.section_id !== undefined) {
//               hasValidSections = true;
//             }
//           });
//         }
//       });

//       if (!hasValidSections) {
//         showToast("⚠️ AI couldn't find suitable sections. Try manual assignment.", "warning");
//         setAiLoading(false);
//         return;
//       }

//       // Start with current schedule (don't reset to empty)
//       const aiSchedule = JSON.parse(JSON.stringify(scheduleData.schedule));
//       let updatedCount = 0;

//       // Map AI recommendations to proper time slots
//       daysOfWeek.forEach(day => {
//         if (aiRaw[day] && Array.isArray(aiRaw[day])) {
//           aiRaw[day].forEach((aiSlot) => {
//             // Find matching time slot index based on AI time
//             const timeIndex = timeSlots.findIndex(slot => {
//               // Extract hour from AI time (e.g., "08:30:00 - 09:30" -> "08")
//               const aiHour = aiSlot.time?.split(':')[0];
//               const slotHour = slot.split(':')[0];
//               return aiHour === slotHour;
//             });

//             console.log(`Processing ${day} - AI time: ${aiSlot.time}, Matched index: ${timeIndex}, Section ID: ${aiSlot.section_id}`);

//             // If we found a matching time slot and have a section_id
//             if (timeIndex !== -1 && aiSlot.section_id && !aiSchedule[day][timeIndex].isBreak) {
//               aiSchedule[day][timeIndex].section_id = aiSlot.section_id;
//               updatedCount++;
//             }
//           });
//         }
//       });

//       console.log(`Updated ${updatedCount} time slots`);

//       setGeneratedSchedules(prev =>
//         prev.map(schedule => {
//           if (schedule.id === scheduleData.id && schedule.group === scheduleData.group) {
//             return { ...schedule, schedule: aiSchedule };
//           }
//           return schedule;
//         })
//       );

//       showToast(`✅ AI applied ${updatedCount} recommendations!`, "success");
//     }
//   } catch (error) {
//     showToast("AI recommendation failed: " + (error.response?.data?.error || error.message), "danger");
//     console.error("AI recommendation error:", error);
//   } finally {
//     setAiLoading(false);
//   }
// };




//   const generateEmptySchedule = () => {
//     const schedule = {};
//     daysOfWeek.forEach(day => {
//       schedule[day] = timeSlots.map(slot => ({
//         time: slot,
//         section_id: null,
//         isBreak: slot === "12:00 - 13:00"
//       }));
//     });
//     return schedule;
//   };

//   const handleCellChange = async (scheduleData, day, timeIndex, sectionId) => {
//     if (!sectionId) return;

//     try {
//       await apiClient.post(`/schedules/${scheduleData.id}/slots`, {
//         section_id: parseInt(sectionId),
//         group_number: scheduleData.group,
//         day_of_week: day,
//         time_slot: timeSlots[timeIndex]
//       });

//       setGeneratedSchedules(prev =>
//         prev.map(schedule => {
//           if (schedule.id === scheduleData.id && schedule.group === scheduleData.group) {
//             const newSchedule = { ...schedule };
//             newSchedule.schedule[day][timeIndex].section_id = sectionId;
//             return newSchedule;
//           }
//           return schedule;
//         })
//       );

//       showToast("✅ Section assigned successfully", "success");
//     } catch (error) {
//       showToast("Error assigning section: " + (error.response?.data?.error || error.message), "danger");
//     }
//   };

//   const handlePublishSchedule = async (scheduleId) => {
//     if (!window.confirm("Are you sure you want to publish this schedule? Students will be notified.")) {
//       return;
//     }

//     try {
//       const response = await apiClient.patch(`/schedules/${scheduleId}/publish`);
//       showToast(`✅ ${response.data.message}`, "success");
//       fetchSchedules();
//       setGeneratedSchedules([]);
//     } catch (error) {
//       showToast("Error publishing schedule: " + (error.response?.data?.error || error.message), "danger");
//     }
//   };

//   const getSectionDisplay = (sectionId) => {
//     const section = availableSections.find(s => s.id === parseInt(sectionId));
//     return section ? `${section.course_code} - ${section.type}` : "";
//   };

//   return (
//     <div className="container" style={{ maxWidth: "1200px" }}>
//       {toast.show && (
//         <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
//           <div className={`toast show align-items-center text-white bg-${toast.type} border-0`} role="alert">
//             <div className="d-flex">
//               <div className="toast-body">{toast.message}</div>
//               <button
//                 type="button"
//                 className="btn-close btn-close-white me-2 m-auto"
//                 onClick={() => setToast({ show: false })}
//               ></button>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="d-flex justify-content-between align-items-center mb-4 pt-3">
//         <div>
//           <h3 className="text-info mb-1">Create Schedule</h3>
//           <p className="text-muted mb-0">Total Schedules: {schedules.length}</p>
//         </div>
//         <button
//           className="btn btn-info text-white"
//           onClick={() => setShowForm(!showForm)}
//         >
//           {showForm ? "Cancel" : "Create New Schedule"}
//         </button>
//       </div>

//       {showForm && (
//         <div className="bg-light p-4 rounded mb-4 shadow-sm">
//           <h5 className="text-info mb-4">Create New Schedule</h5>

//           <div className="row">
//             <div className="col-md-4 mb-3">
//               <label className="form-label text-info fw-semibold">Semester</label>
//               <select
//                 className="form-select"
//                 value={formData.semester}
//                 onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
//               >
//                 <option value="">Select Semester</option>
//                 {semesters.map((sem) => (
//                   <option key={sem} value={sem}>{sem}</option>
//                 ))}
//               </select>
//             </div>

//             <div className="col-md-4 mb-3">
//               <label className="form-label text-info fw-semibold">Level</label>
//               <select
//                 className="form-select"
//                 value={formData.level_id}
//                 onChange={(e) => setFormData({ ...formData, level_id: e.target.value })}
//               >
//                 <option value="">Select Level</option>
//                 {levels.map((level) => (
//                   <option key={level.id} value={level.id}>{level.name}</option>
//                 ))}
//               </select>
//             </div>

//             <div className="col-md-4 mb-3">
//               <label className="form-label text-info fw-semibold">Number of Groups</label>
//               <select
//                 className="form-select"
//                 value={formData.number_of_groups}
//                 onChange={(e) => setFormData({ ...formData, number_of_groups: e.target.value })}
//               >
//                 <option value="">Select Groups</option>
//                 {groupOptions.map((option) => (
//                   <option key={option} value={option}>{option} Group{option > 1 ? 's' : ''}</option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           <button
//             type="button"
//             className="btn btn-info text-white"
//             onClick={handleGenerateSchedule}
//             disabled={loading}
//           >
//             {loading ? "Generating..." : "Generate Schedule"}
//           </button>
//         </div>
//       )}

//       {generatedSchedules.map((scheduleData) => (
//         <div key={`${scheduleData.id}-${scheduleData.group}`} className="mb-5">
//           <div className="d-flex justify-content-between align-items-center mb-3">
//             <h4 className="text-info mb-0">
//               Level {scheduleData.level} – Group {scheduleData.group} ({scheduleData.semester})
//             </h4>
//             <button
//               className="btn btn-gradient text-white d-flex align-items-center gap-2"
//               style={{
//                 background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
//                 border: "none"
//               }}
//               onClick={() => handleAIRecommendation(scheduleData)}
//               disabled={aiLoading}
//             >
//               <Sparkles size={18} />
//               {aiLoading ? "AI Processing..." : "AI Auto-Schedule"}
//             </button>
//           </div>

//           <div className="bg-white rounded shadow-sm overflow-hidden">
//             <div className="table-responsive">
//               <table className="table table-bordered mb-0" style={{ minWidth: "900px" }}>
//                 <thead className="bg-light">
//                   <tr>
//                     <th className="text-info" style={{ width: "120px" }}>Time</th>
//                     {daysOfWeek.map(day => (
//                       <th key={day} className="text-info text-center">{day}</th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {timeSlots.map((slot, timeIndex) => (
//                     <tr key={slot}>
//                       <td className="fw-semibold text-secondary">{slot}</td>
//                       {daysOfWeek.map((day) => {
//                         const cell = scheduleData.schedule[day][timeIndex];
//                         const isBreak = cell.isBreak;

//                         return (
//                           <td
//                             key={day}
//                             className={isBreak ? "bg-info bg-opacity-10" : ""}
//                             style={{ padding: "8px" }}
//                           >
//                             {isBreak ? (
//                               <div className="text-center fw-bold text-info">Break</div>
//                             ) : (
//                               <select
//                                 className="form-select form-select-sm"
//                                 value={cell.section_id || ""}
//                                 onChange={(e) => handleCellChange(scheduleData, day, timeIndex, e.target.value)}
//                               >
//                                 <option value="">-- Empty --</option>
//                                 {availableSections.map((section) => (
//                                   <option key={section.id} value={section.id}>
//                                     {section.course_code} - {section.type}
//                                   </option>
//                                 ))}
//                               </select>
//                             )}
//                           </td>
//                         );
//                       })}
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             <div className="d-flex justify-content-end gap-2 p-3 bg-light">
//               <button
//                 className="btn btn-success text-white"
//                 onClick={() => handlePublishSchedule(scheduleData.id)}
//               >
//                 📢 Publish Schedule
//               </button>
//             </div>
//           </div>
//         </div>
//       ))}

//       {generatedSchedules.length === 0 && !showForm && (
//         <div className="text-center text-muted py-5">
//           <p>No schedules generated yet. Click "Create New Schedule" to start.</p>
//         </div>
//       )}
//     </div>
//   );
// }


import React, { useState, useEffect } from "react";
import { Sparkles, Eye, Trash2, Calendar, Users, BookOpen } from "lucide-react";

// Replace this with your actual import
// import apiClient from "../../Services/apiClient";

// Mock API client for demo
import apiClient from "../../Services/apiClient";


export default function CreateSchedule() {
  const [schedules, setSchedules] = useState([]);
  const [levels, setLevels] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [generatedSchedules, setGeneratedSchedules] = useState([]);
  const [availableSections, setAvailableSections] = useState([]);
  const [viewMode, setViewMode] = useState("list"); // "list" or "create"
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const [formData, setFormData] = useState({
    semester: "",
    level_id: "",
    number_of_groups: ""
  });

  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const semesters = ["Semester 1", "Semester 2"];
  const groupOptions = ["1", "2", "3"];
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

  const timeSlots = [
    "08:00 - 09:00",
    "09:00 - 10:00",
    "10:00 - 11:00",
    "11:00 - 12:00",
    "12:00 - 13:00",
    "13:00 - 14:00",
    "14:00 - 15:00"
  ];

  useEffect(() => {
    fetchLevels();
    fetchSchedules();
  }, []);

  const fetchLevels = async () => {
    try {
      const response = await apiClient.get("/dropdowns/terms");
      setLevels(response.data || []);
    } catch (error) {
      console.error("Failed to fetch levels:", error);
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await apiClient.get("/schedules");
      setSchedules(response.data || []);
    } catch (error) {
      console.error("Failed to fetch schedules:", error);
    }
  };

  const fetchAvailableSections = async (level_id) => {
    try {
      const response = await apiClient.get(`/simple-sections`);
      setAvailableSections(response.data || []);
    } catch (error) {
      console.error("Failed to fetch sections:", error);
    }
  };

  const handleGenerateSchedule = async () => {
    if (!formData.semester || !formData.level_id || !formData.number_of_groups) {
      showToast("Please fill all fields", "warning");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post("/schedules", {
        semester: formData.semester,
        level_id: parseInt(formData.level_id),
        number_of_groups: parseInt(formData.number_of_groups)
      });

      const newSchedule = response.data.schedule;
      await fetchAvailableSections(formData.level_id);

      const numGroups = parseInt(formData.number_of_groups);
      const levelName = levels.find(l => l.id === parseInt(formData.level_id))?.name || "";

      const newSchedules = [];
      for (let i = 1; i <= numGroups; i++) {
        newSchedules.push({
          id: newSchedule.id,
          semester: formData.semester,
          level: levelName,
          group: i,
          schedule: generateEmptySchedule()
        });
      }

      setGeneratedSchedules(newSchedules);
      showToast(`✅ ${numGroups} schedule(s) generated successfully!`, "success");
      setShowForm(false);
      fetchSchedules();
    } catch (error) {
      showToast("Error generating schedule: " + (error.response?.data?.error || error.message), "danger");
      console.error("Failed to generate schedule:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAIRecommendation = async (scheduleData) => {
    setAiLoading(true);
    try {
      showToast("🤖 AI is analyzing and generating optimal schedule...", "info");

      const response = await apiClient.post(`/ai/generate-schedule`, {
        schedule_id: scheduleData.id,
        group_number: scheduleData.group,
        available_sections: availableSections
      });

      if (response.data && response.data.recommendations) {
        const aiRaw = response.data.recommendations;

        let hasValidSections = false;
        Object.values(aiRaw).forEach(daySlots => {
          if (Array.isArray(daySlots)) {
            daySlots.forEach(slot => {
              if (slot.section_id !== null && slot.section_id !== undefined) {
                hasValidSections = true;
              }
            });
          }
        });

        if (!hasValidSections) {
          showToast("⚠️ AI couldn't find suitable sections. Try manual assignment.", "warning");
          setAiLoading(false);
          return;
        }

        const aiSchedule = JSON.parse(JSON.stringify(scheduleData.schedule));
        let updatedCount = 0;

        daysOfWeek.forEach(day => {
          if (aiRaw[day] && Array.isArray(aiRaw[day])) {
            aiRaw[day].forEach((aiSlot) => {
              const timeIndex = timeSlots.findIndex(slot => {
                const aiHour = aiSlot.time?.split(':')[0];
                const slotHour = slot.split(':')[0];
                return aiHour === slotHour;
              });

              if (timeIndex !== -1 && aiSlot.section_id && !aiSchedule[day][timeIndex].isBreak) {
                aiSchedule[day][timeIndex].section_id = aiSlot.section_id;
                updatedCount++;
              }
            });
          }
        });

        setGeneratedSchedules(prev =>
          prev.map(schedule => {
            if (schedule.id === scheduleData.id && schedule.group === scheduleData.group) {
              return { ...schedule, schedule: aiSchedule };
            }
            return schedule;
          })
        );

        showToast(`✅ AI applied ${updatedCount} recommendations!`, "success");
      }
    } catch (error) {
      showToast("AI recommendation failed: " + (error.response?.data?.error || error.message), "danger");
      console.error("AI recommendation error:", error);
    } finally {
      setAiLoading(false);
    }
  };

  const generateEmptySchedule = () => {
    const schedule = {};
    daysOfWeek.forEach(day => {
      schedule[day] = timeSlots.map(slot => ({
        time: slot,
        section_id: null,
        isBreak: slot === "12:00 - 13:00"
      }));
    });
    return schedule;
  };

  const handleCellChange = async (scheduleData, day, timeIndex, sectionId) => {
    if (!sectionId) return;

    try {
      await apiClient.post(`/schedules/${scheduleData.id}/slots`, {
        section_id: parseInt(sectionId),
        group_number: scheduleData.group,
        day_of_week: day,
        time_slot: timeSlots[timeIndex]
      });

      setGeneratedSchedules(prev =>
        prev.map(schedule => {
          if (schedule.id === scheduleData.id && schedule.group === scheduleData.group) {
            const newSchedule = { ...schedule };
            newSchedule.schedule[day][timeIndex].section_id = sectionId;
            return newSchedule;
          }
          return schedule;
        })
      );

      showToast("✅ Section assigned successfully", "success");
    } catch (error) {
      showToast("Error assigning section: " + (error.response?.data?.error || error.message), "danger");
    }
  };

  const handlePublishSchedule = async (scheduleId) => {
    if (!window.confirm("Are you sure you want to publish this schedule? Students will be notified.")) {
      return;
    }

    try {
      const response = await apiClient.patch(`/schedules/${scheduleId}/publish`);
      showToast(`✅ ${response.data.message}`, "success");
      fetchSchedules();
      setGeneratedSchedules([]);
    } catch (error) {
      showToast("Error publishing schedule: " + (error.response?.data?.error || error.message), "danger");
    }
  };

  const handleViewSchedule = async (scheduleId) => {
    try {
      const response = await apiClient.get(`/schedules/${scheduleId}`);
      setSelectedSchedule(response.data);
      setShowViewModal(true);
    } catch (error) {
      showToast("Failed to load schedule details", "danger");
      console.error("Error viewing schedule:", error);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm("Are you sure you want to delete this schedule? This action cannot be undone.")) {
      return;
    }

    try {
      await apiClient.delete(`/schedules/${scheduleId}`);
      showToast("✅ Schedule deleted successfully", "success");
      fetchSchedules();
    } catch (error) {
      showToast("Error deleting schedule: " + (error.response?.data?.error || error.message), "danger");
      console.error("Error deleting schedule:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      published: { bg: "success", text: "Published" },
      draft: { bg: "secondary", text: "Draft" }
    };
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`badge bg-${config.bg}`}>{config.text}</span>
    );
  };

  return (
    <div className="container" style={{ maxWidth: "1400px" }}>
      {toast.show && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
          <div className={`toast show align-items-center text-white bg-${toast.type} border-0`} role="alert">
            <div className="d-flex">
              <div className="toast-body">{toast.message}</div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                onClick={() => setToast({ show: false })}
              ></button>
            </div>
          </div>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4 pt-3">
        <div>
          <h3 className="text-info mb-1">Schedule Management</h3>
          <p className="text-muted mb-0">Total Schedules: {schedules.length}</p>
        </div>
        <div className="btn-group">
          <button
            className={`btn ${viewMode === 'list' ? 'btn-info text-white' : 'btn-outline-info'}`}
            onClick={() => setViewMode('list')}
          >
            All Schedules
          </button>
          <button
            className={`btn ${viewMode === 'create' ? 'btn-info text-white' : 'btn-outline-info'}`}
            onClick={() => setViewMode('create')}
          >
            Create New
          </button>
        </div>
      </div>

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white rounded shadow-sm p-4">
          <h5 className="text-info mb-4">All Schedules</h5>
          
          {schedules.length === 0 ? (
            <div className="text-center py-5">
              <Calendar size={64} className="text-muted mb-3" />
              <p className="text-muted">No schedules found. Create your first schedule!</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="bg-light">
                  <tr>
                    <th className="text-info">ID</th>
                    <th className="text-info">Semester</th>
                    <th className="text-info">Level</th>
                    <th className="text-info">Groups</th>
                    <th className="text-info">Status</th>
                    <th className="text-info">Created Date</th>
                    <th className="text-info text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((schedule) => (
                    <tr key={schedule.id}>
                      <td className="fw-bold">#{schedule.id}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <BookOpen size={18} className="text-info me-2" />
                          {schedule.semester}
                        </div>
                      </td>
                      <td>{schedule.level_name}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <Users size={18} className="text-info me-2" />
                          {schedule.number_of_groups}
                        </div>
                      </td>
                      <td>{getStatusBadge(schedule.status)}</td>
                      <td className="text-muted">{formatDate(schedule.created_at)}</td>
                      <td>
                        <div className="d-flex gap-2 justify-content-center">
                          <button
                            className="btn btn-sm btn-outline-info d-flex align-items-center gap-1"
                            onClick={() => handleViewSchedule(schedule.id)}
                            title="View Details"
                          >
                            <Eye size={16} />
                            View
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                            onClick={() => handleDeleteSchedule(schedule.id)}
                            title="Delete Schedule"
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CREATE VIEW */}
      {viewMode === 'create' && (
        <>
          {!showForm && generatedSchedules.length === 0 && (
            <div className="text-center py-5">
              <button
                className="btn btn-info btn-lg text-white"
                onClick={() => setShowForm(true)}
              >
                + Create New Schedule
              </button>
            </div>
          )}

          {showForm && (
            <div className="bg-light p-4 rounded mb-4 shadow-sm">
              <h5 className="text-info mb-4">Create New Schedule</h5>

              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label text-info fw-semibold">Semester</label>
                  <select
                    className="form-select"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  >
                    <option value="">Select Semester</option>
                    {semesters.map((sem) => (
                      <option key={sem} value={sem}>{sem}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-4 mb-3">
                  <label className="form-label text-info fw-semibold">Level</label>
                  <select
                    className="form-select"
                    value={formData.level_id}
                    onChange={(e) => setFormData({ ...formData, level_id: e.target.value })}
                  >
                    <option value="">Select Level</option>
                    {levels.map((level) => (
                      <option key={level.id} value={level.id}>{level.name}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-4 mb-3">
                  <label className="form-label text-info fw-semibold">Number of Groups</label>
                  <select
                    className="form-select"
                    value={formData.number_of_groups}
                    onChange={(e) => setFormData({ ...formData, number_of_groups: e.target.value })}
                  >
                    <option value="">Select Groups</option>
                    {groupOptions.map((option) => (
                      <option key={option} value={option}>{option} Group{option > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-info text-white"
                  onClick={handleGenerateSchedule}
                  disabled={loading}
                >
                  {loading ? "Generating..." : "Generate Schedule"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {generatedSchedules.map((scheduleData) => (
            <div key={`${scheduleData.id}-${scheduleData.group}`} className="mb-5">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="text-info mb-0">
                  Level {scheduleData.level} – Group {scheduleData.group} ({scheduleData.semester})
                </h4>
                <button
                  className="btn btn-gradient text-white d-flex align-items-center gap-2"
                  style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "none"
                  }}
                  onClick={() => handleAIRecommendation(scheduleData)}
                  disabled={aiLoading}
                >
                  <Sparkles size={18} />
                  {aiLoading ? "AI Processing..." : "AI Auto-Schedule"}
                </button>
              </div>

              <div className="bg-white rounded shadow-sm overflow-hidden">
                <div className="table-responsive">
                  <table className="table table-bordered mb-0" style={{ minWidth: "900px" }}>
                    <thead className="bg-light">
                      <tr>
                        <th className="text-info" style={{ width: "120px" }}>Time</th>
                        {daysOfWeek.map(day => (
                          <th key={day} className="text-info text-center">{day}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {timeSlots.map((slot, timeIndex) => (
                        <tr key={slot}>
                          <td className="fw-semibold text-secondary">{slot}</td>
                          {daysOfWeek.map((day) => {
                            const cell = scheduleData.schedule[day][timeIndex];
                            const isBreak = cell.isBreak;

                            return (
                              <td
                                key={day}
                                className={isBreak ? "bg-info bg-opacity-10" : ""}
                                style={{ padding: "8px" }}
                              >
                                {isBreak ? (
                                  <div className="text-center fw-bold text-info">Break</div>
                                ) : (
                                  <select
                                    className="form-select form-select-sm"
                                    value={cell.section_id || ""}
                                    onChange={(e) => handleCellChange(scheduleData, day, timeIndex, e.target.value)}
                                  >
                                    <option value="">-- Empty --</option>
                                    {availableSections.map((section) => (
                                      <option key={section.id} value={section.id}>
                                        {section.course_code} - {section.type}
                                      </option>
                                    ))}
                                  </select>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="d-flex justify-content-end gap-2 p-3 bg-light">
                  <button
                    className="btn btn-success text-white"
                    onClick={() => handlePublishSchedule(scheduleData.id)}
                  >
                    📢 Publish Schedule
                  </button>
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {/* VIEW MODAL */}
      {showViewModal && selectedSchedule && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-xl modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header bg-info text-white">
                <h5 className="modal-title">
                  Schedule Details - {selectedSchedule.semester} ({selectedSchedule.level_name})
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowViewModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-3">
                    <strong className="text-info">Semester:</strong>
                    <p>{selectedSchedule.semester}</p>
                  </div>
                  <div className="col-md-3">
                    <strong className="text-info">Level:</strong>
                    <p>{selectedSchedule.level_name}</p>
                  </div>
                  <div className="col-md-3">
                    <strong className="text-info">Groups:</strong>
                    <p>{selectedSchedule.number_of_groups}</p>
                  </div>
                  <div className="col-md-3">
                    <strong className="text-info">Status:</strong>
                    <p>{getStatusBadge(selectedSchedule.status)}</p>
                  </div>
                </div>

                {selectedSchedule.slots && selectedSchedule.slots.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover">
                      <thead className="bg-light">
                        <tr>
                          <th className="text-info">Day</th>
                          <th className="text-info">Time</th>
                          <th className="text-info">Group</th>
                          <th className="text-info">Course</th>
                          <th className="text-info">Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedSchedule.slots.map((slot, index) => (
                          <tr key={index}>
                            <td className="fw-semibold">{slot.day_of_week}</td>
                            <td>{slot.time_slot}</td>
                            <td>Group {slot.group_number}</td>
                            <td className="text-info">{slot.course_code}</td>
                            <td>
                              <span className={`badge bg-${slot.type === 'Lecture' ? 'primary' : 'success'}`}>
                                {slot.type}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center text-muted py-4">
                    <Calendar size={48} className="mb-3" />
                    <p>No slots scheduled yet</p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowViewModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}