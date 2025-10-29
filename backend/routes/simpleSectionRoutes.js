const express = require("express");
const {
  createSimpleSection,
  getSimpleSections,
  getSimpleSectionById,
  updateSimpleSection,
  deleteSimpleSection
}= require( "../controllers/simpleSectionController");

const router = express.Router();

router.post("/", createSimpleSection);
router.get("/", getSimpleSections);
router.get("/:id", getSimpleSectionById);
router.put("/:id", updateSimpleSection);
router.delete("/:id", deleteSimpleSection);

module.exports = router;
