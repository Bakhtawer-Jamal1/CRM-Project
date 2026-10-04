const express = require("express");
const auth = require("../middleware/authMiddleware");
const { getSummary } = require("../controllers/dashboardController");

const router = express.Router();

router.get("/", auth, getSummary);

module.exports = router;