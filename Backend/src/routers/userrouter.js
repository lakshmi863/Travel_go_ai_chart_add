const express = require("express");
const router = express.Router();

const { registerUser, loginUser } = require("../controllers/usercontroller");
const { validateRegistration, verifyToken } = require("../middlewares/authmiddleware");

// REGISTER
router.post("/register", validateRegistration, registerUser);

// LOGIN
router.post("/login", loginUser);

// PROTECTED ROUTEs
router.get("/profile", verifyToken, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

module.exports = router;

