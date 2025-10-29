import React, { useState } from "react";

export default function LoadCommitteeCourses() {
  const [courses, setCourses] = useState([
    { id: 1, courseName: "CSC132-Programming Skills", level: "" },
    { id: 2, courseName: "SWE315-Introduction", level: "" }
  ]);
  const [publishing, setPublishing] = useState(false);

  const levels = ["Level 1", "Level 2", "Level 3", "Level 4", "Level 5", "Level 6", "Level 7", "Level 8"];

  const addNewCourse = () => {
    const newCourse = {
      id: Date.now(),
      courseName: "",
      level: ""
    };
    setCourses([...courses, newCourse]);
  };

  const removeCourse = (id) => {
    setCourses(courses.filter(course => course.id !== id));
  };

  const updateCourse = (id, field, value) => {
    setCourses(courses.map(course => 
      course.id === id ? { ...course, [field]: value } : course
    ));
  };

  const handlePublish = async () => {
    // Validate that all courses have required fields
    const incompleteCourses = courses.filter(c => !c.courseName || !c.level);
    if (incompleteCourses.length > 0) {
      alert("Please fill in all course details and select a level for each course");
      return;
    }

    setPublishing(true);
    try {
      // Real API call would be here
      // await apiClient.post('/load-committee/courses', { courses });
      
      // Mock success
      setTimeout(() => {
        alert("Courses published successfully!");
        setPublishing(false);
      }, 1500);
    } catch (error) {
      console.error("Failed to publish courses:", error);
      alert("Failed to publish courses. Please try again.");
      setPublishing(false);
    }
  };

  return (
    <div className="container-fluid px-3 px-md-4 py-4" style={{ maxWidth: "900px" }}>
      <h4 className="text-info mb-4">Load Committee</h4>

      <div className="bg-white rounded-3 shadow-sm p-3 p-md-4" style={{ border: "2px solid #17a2b8" }}>
        <h5 className="text-info mb-4 pb-2" style={{ borderBottom: "2px solid #17a2b8" }}>
          Courses Assign
        </h5>

        {/* Courses List */}
        <div className="mb-4">
          {courses.map((course, index) => (
            <div key={course.id} className="mb-3">
              <div className="row g-2 align-items-center">
                {/* Course Name Input (Combined Code and Name) */}
                <div className="col-12 col-md-9">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., CSC132-Programming Skills"
                    value={course.courseName}
                    onChange={(e) => updateCourse(course.id, 'courseName', e.target.value)}
                    style={{ borderColor: "#17a2b8" }}
                  />
                </div>

                {/* Level Dropdown */}
                <div className="col-9 col-md-2">
                  <select
                    className="form-select"
                    value={course.level}
                    onChange={(e) => updateCourse(course.id, 'level', e.target.value)}
                    style={{ borderColor: "#17a2b8" }}
                  >
                    <option value="">Level</option>
                    {levels.map(level => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Remove Button */}
                <div className="col-3 col-md-1 text-end">
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => removeCourse(course.id)}
                    style={{ padding: "0.375rem 0.75rem" }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Display selected values on mobile */}
              <div className="d-md-none mt-2">
                {course.courseName && (
                  <span className="badge bg-info me-2">{course.courseName}</span>
                )}
                {course.level && (
                  <span className="badge bg-success">{course.level}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Button */}
        <div className="mb-4">
          <button
            className="btn btn-info text-white"
            onClick={addNewCourse}
            style={{ minWidth: "100px" }}
          >
            Add
          </button>
        </div>

        {/* Assign Button */}
        <div className="d-flex justify-content-center justify-content-md-end">
          <button
            className="btn btn-info text-white px-4 px-md-5 py-2"
            onClick={handlePublish}
            disabled={publishing || courses.length === 0}
            style={{ fontSize: "1rem", fontWeight: "500" }}
          >
            {publishing ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Publishing...
              </>
            ) : (
              "Assign"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}