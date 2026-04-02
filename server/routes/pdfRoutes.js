const express = require("express");
const multer = require("multer");
const { mergePDF, compressPDF } = require("../controllers/pdfController");

const router = express.Router();

const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 25 * 1024 * 1024
  }
});

router.post("/merge", upload.array("files", 10), mergePDF);
router.post("/compress", upload.single("file"), compressPDF);

module.exports = router;