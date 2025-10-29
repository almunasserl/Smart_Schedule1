const express = require("express");
const router = express.Router();
const {
  generateSmartSections,
  generateAISchedule
} = require("../controllers/aiSectionsController");

router.get("/smart-sections", generateSmartSections);
router.post("/generate-schedule", generateAISchedule)

module.exports = router;
