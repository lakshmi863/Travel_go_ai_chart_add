const express = require("express");

const router = express.Router();

const { travelAI } = require("../controllers/aicontroller");
const { verifyToken } = require("../middlewares/authmiddleware");

router.post("/chat", verifyToken, travelAI);

module.exports = router;