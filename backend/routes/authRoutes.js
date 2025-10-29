const express = require("express");
const router = express.Router();
const {
  signUp,
  login,
  enable2FA,
  verify2FA,
  requestPasswordReset,
  resetPassword,
  getAllUsers,
  updateUserStatus,
} = require("../controllers/authController");

router.post("/signup", signUp);
router.post("/login", login);
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);
router.get("/users", getAllUsers);
router.patch("/users/:userId/status", updateUserStatus);

module.exports = router;
