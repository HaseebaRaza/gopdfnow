document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");

    if (targetId.length > 1) {
      const target = document.querySelector(targetId);

      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  });
});

// =========================
// Compress PDF
// =========================
const compressForm = document.getElementById("compressForm");
const compressPdfFile = document.getElementById("compressPdfFile");
const compressionLevel = document.getElementById("compressionLevel");
const compressStatusMessage = document.getElementById("compressStatusMessage");

if (compressForm && compressPdfFile && compressionLevel && compressStatusMessage) {
  compressForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const file = compressPdfFile.files[0];

    if (!file) {
      compressStatusMessage.textContent = "Please choose a PDF file.";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("compressionLevel", compressionLevel.value);

    compressStatusMessage.textContent = "Compressing PDF...";

    try {
      const response = await fetch("/api/pdf/compress", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        compressStatusMessage.textContent =
          errorData.message || "Failed to compress PDF.";
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      let filename = "compressed_GoPDFNow.com.au.pdf";
      const contentDisposition = response.headers.get("Content-Disposition");

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match && match[1]) {
          filename = match[1];
        }
      }

      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();

      window.URL.revokeObjectURL(url);
      compressStatusMessage.textContent =
        "Compressed successfully. Download started.";
    } catch (error) {
      console.error("Compress fetch error:", error);
      compressStatusMessage.textContent =
        "Something went wrong. Please try again.";
    }
  });
}

// =========================
// Merge PDF
// =========================
const mergeForm = document.getElementById("mergeForm");
const pdfFiles = document.getElementById("pdfFiles");
const statusMessage = document.getElementById("statusMessage");

if (mergeForm && pdfFiles && statusMessage) {
  console.log("Merge form detected");

  mergeForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    console.log("Merge submit clicked");

    const files = pdfFiles.files;

    if (!files || files.length < 2) {
      statusMessage.textContent = "Please select at least 2 PDF files.";
      return;
    }

    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    statusMessage.textContent = "Merging PDFs...";

    try {
      const response = await fetch("/api/pdf/merge", {
        method: "POST",
        body: formData
      });

      console.log("Merge response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.log("Merge error data:", errorData);
        statusMessage.textContent =
          errorData.message || "Failed to merge PDF files.";
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      let filename = "merged_GoPDFNow.com.au.pdf";
      const contentDisposition = response.headers.get("Content-Disposition");

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match && match[1]) {
          filename = match[1];
        }
      }

      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();

      window.URL.revokeObjectURL(url);
      statusMessage.textContent = "Merged successfully. Download started.";
    } catch (error) {
      console.error("Merge fetch error:", error);
      statusMessage.textContent = "Something went wrong. Please try again.";
    }
  });
}

// =========================
// PDF to Word
// =========================
const pdfToWordForm = document.getElementById("pdfToWordForm");
const pdfToWordFile = document.getElementById("pdfToWordFile");
const pdfToWordStatusMessage = document.getElementById("pdfToWordStatusMessage");

if (pdfToWordForm && pdfToWordFile && pdfToWordStatusMessage) {
  pdfToWordForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const file = pdfToWordFile.files[0];

    if (!file) {
      pdfToWordStatusMessage.textContent = "Please choose a PDF file.";
      return;
    }

    pdfToWordStatusMessage.textContent =
      "PDF to Word UI is ready. Backend can be connected next.";
  });
}
