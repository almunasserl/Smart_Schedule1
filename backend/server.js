const express = require("express");
const cors = require("cors");
const DB = require("./config/db");
require("dotenv").config();
const facultyRoutes = require("./routes/facultyRoutes");
const studentRoutes = require("./routes/studentRoutes");
const authRoutes = require("./routes/authRoutes");
const reportRoutes = require("./routes/reportRoutes");
const ruleRoutes = require("./routes/ruleRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const surveyRoutes = require("./routes/surveyRoutes");
const sectionRoutes = require("./routes/sectionRoutes");
const facultyCoursesRoutes = require("./routes/facultyCoursesRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const courseRoutes = require("./routes/courseRoutes");
const dropdownsRoutes = require("./routes/dropdownsRoutes");
const aiRoutes = require("./routes/aiRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const irregularRoutes=require("./routes/irregularRoutes")
const app = express();
import cors from "cors";

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://smart-schedule1.vercel.app"
  ],
  credentials: true
}));
app.use(express.json());

app.use("/api/faculty", facultyRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/rules", ruleRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/surveys", surveyRoutes);
app.use("/api/sections", sectionRoutes);
app.use("/api/faculty-courses", facultyCoursesRoutes);
app.use("/api/irregular", irregularRoutes);


app.use("/api/notifications", notificationRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/dropdowns", dropdownsRoutes);
app.use("/api/ai", aiRoutes);

// new route for create schedule and publish schedule
app.use("/api/schedules", scheduleRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
