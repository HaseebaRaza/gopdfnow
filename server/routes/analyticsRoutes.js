const express = require("express");
const router = express.Router();
const { trackVisit, getReport } = require("../controllers/analyticsController");

router.post("/track", trackVisit);
router.get("/report", getReport);

module.exports = router;