const express = require("express");
const router = express.Router();
const rulesController = require("../controllers/ruleController"); // ⚠️ singular

router.get("/", rulesController.getAllRules);
router.post("/", rulesController.createRule);
router.patch("/:id", rulesController.updateRule);
router.delete("/:id", rulesController.deleteRule);

module.exports = router;