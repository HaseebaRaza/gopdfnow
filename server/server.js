require("dotenv").config({ path: "./.env" });

const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");
const pdfRoutes = require("./routes/pdfRoutes");
const waitlistRoutes = require("./routes/waitlistRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "../public")));

app.use("/api/pdf", pdfRoutes);
app.use("/api/waitlist", waitlistRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.get("/merge-pdf", (req, res) => {
  res.sendFile(path.join(__dirname, "../pages/merge-pdf.html"));
});

app.get("/compress-pdf", (req, res) => {
  res.sendFile(path.join(__dirname, "../pages/compress-pdf.html"));
});

app.get("/pdf-to-word", (req, res) => {
  res.sendFile(path.join(__dirname, "../pages/pdf-to-word.html"));
});

app.get("/blog", (req, res) => {
  res.sendFile(path.join(__dirname, "../pages/blog.html"));
});

app.get("/terms", (req, res) => {
  res.sendFile(path.join(__dirname, "../pages/terms.html"));
});

app.get("/privacy", (req, res) => {
  res.sendFile(path.join(__dirname, "../pages/privacy.html"));
});

app.get("/robots.txt", (req, res) => {
  res.sendFile(path.join(__dirname, "../robots.txt"));
});

app.get("/sitemap.xml", (req, res) => {
  res.sendFile(path.join(__dirname, "../sitemap.xml"));
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});