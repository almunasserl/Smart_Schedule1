const express = require("express");
const router = express.Router();
const dropdownsController = require("../controllers/dropdownsController");

router.get("/courses", dropdownsController.getCoursesList);
router.get("/faculty", dropdownsController.getFacultyList);
router.get("/rooms", dropdownsController.getRoomsList);
router.get("/levels", dropdownsController.getLevelsList);

router.get("/students", dropdownsController.getStudentsList);
module.exports = router;
