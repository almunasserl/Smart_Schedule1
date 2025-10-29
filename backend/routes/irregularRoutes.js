const express = require("express");
const router = express.Router();
const irregularController = require("../controllers/irregularController");

// 🔹 Routes
router.get("/", irregularController.getAll);
router.get("/:id", irregularController.getOne);
router.post("/", irregularController.create);
router.put("/:id", irregularController.update);
router.delete("/:id", irregularController.remove);

module.exports = router;
