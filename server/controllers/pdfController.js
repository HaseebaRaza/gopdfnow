const fs = require("fs");
const axios = require("axios");

// Simple in-memory usage tracker
const usageTracker = {};

const PDFCO_API_BASE = "https://api.pdf.co/v1";
const PDFCO_API_KEY = process.env.PDFCO_API_KEY;

async function getPresignedUrl(fileName) {
  const response = await axios.get(
    `${PDFCO_API_BASE}/file/upload/get-presigned-url`,
    {
      params: {
        name: fileName,
        contenttype: "application/octet-stream"
      },
      headers: {
        "x-api-key": PDFCO_API_KEY
      }
    }
  );

  if (!response.data || response.data.error) {
    throw new Error(response.data?.message || "Failed to get upload URL");
  }

  return response.data;
}

async function uploadFileToPdfCo(localFilePath, fileName) {
  const { presignedUrl, url } = await getPresignedUrl(fileName);
  const fileBuffer = fs.readFileSync(localFilePath);

  await axios.put(presignedUrl, fileBuffer, {
    headers: {
      "Content-Type": "application/octet-stream"
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity
  });

  return url;
}

exports.mergePDF = async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress || "unknown";
  const today = new Date().toDateString();

  try {
    if (!PDFCO_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Missing PDFCO_API_KEY in .env"
      });
    }

    if (!usageTracker[ip]) {
      usageTracker[ip] = { date: today, count: 0 };
    }

    if (usageTracker[ip].date !== today) {
      usageTracker[ip] = { date: today, count: 0 };
    }

    if (usageTracker[ip].count >= 5) {
      return res.status(429).json({
        success: false,
        message: "Daily limit reached (5 uses/day). Please upgrade to Pro."
      });
    }

    if (!req.files || req.files.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least 2 PDF files."
      });
    }

    const uploadedUrls = [];

    for (const file of req.files) {
      const uploadedUrl = await uploadFileToPdfCo(file.path, file.originalname);
      uploadedUrls.push(uploadedUrl);
    }

    const mergeResponse = await axios.post(
      `${PDFCO_API_BASE}/pdf/merge`,
      {
        name: "merged.pdf",
        url: uploadedUrls.join(","),
        async: false
      },
      {
        headers: {
          "x-api-key": PDFCO_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    if (!mergeResponse.data || mergeResponse.data.error || !mergeResponse.data.url) {
      throw new Error(mergeResponse.data?.message || "PDF merge failed");
    }

    const fileResponse = await axios.get(mergeResponse.data.url, {
      responseType: "arraybuffer"
    });

    usageTracker[ip].count += 1;

    res.setHeader("Content-Type", "application/pdf");
  const originalName = req.files[0].originalname.replace(".pdf", "");
const finalFileName = `${originalName}_GoPDFNow.com.au.pdf`;

res.setHeader("Content-Disposition", `attachment; filename="${finalFileName}"`);
    res.setHeader("X-Uses-Today", `${usageTracker[ip].count}/5`);

    return res.send(Buffer.from(fileResponse.data));
  } catch (error) {
    console.error("Merge error:", error.response?.data || error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while merging PDFs."
    });
  } finally {
    if (req.files) {
      req.files.forEach((file) => {
        try {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (cleanupError) {
          console.error("Cleanup error:", cleanupError.message);
        }
      });
    }
  }
};
exports.compressPDF = async (req, res) => {
  try {
    if (!PDFCO_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Missing PDFCO_API_KEY in .env"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF file."
      });
    }

    const uploadedUrl = await uploadFileToPdfCo(req.file.path, req.file.originalname);

    const compressResponse = await axios.post(
      "https://api.pdf.co/v2/pdf/compress",
      {
        url: uploadedUrl,
        name: "compressed.pdf",
        async: false
      },
      {
        headers: {
          "x-api-key": PDFCO_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    if (!compressResponse.data || compressResponse.data.error || !compressResponse.data.url) {
      throw new Error(compressResponse.data?.message || "PDF compression failed");
    }

    const fileResponse = await axios.get(compressResponse.data.url, {
      responseType: "arraybuffer"
    });

const finalFileName = `merged_GoPDFNow.com.au.pdf`;

res.setHeader("Content-Type", "application/pdf");
res.setHeader("Content-Disposition", `attachment; filename="${finalFileName}"`);

    return res.send(Buffer.from(fileResponse.data));
  } catch (error) {
    console.error("Compress error:", error.response?.data || error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while compressing the PDF."
    });
  } finally {
    if (req.file) {
      try {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (cleanupError) {
        console.error("Cleanup error:", cleanupError.message);
      }
    }
  }
};