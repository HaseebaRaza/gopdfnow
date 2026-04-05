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

function setMessage(element, text, type = "info") {
  if (!element) return;
  element.textContent = text;
  element.className = `status-message ${type}`;
}

function getFilenameFromResponse(response, fallbackName) {
  let filename = fallbackName;
  const contentDisposition = response.headers.get("Content-Disposition");

  if (contentDisposition) {
    const match = contentDisposition.match(/filename="(.+)"/);
    if (match && match[1]) {
      filename = match[1];
    }
  }

  return filename;
}

function triggerDownload(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");

  downloadLink.href = url;
  downloadLink.download = filename;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();

  window.URL.revokeObjectURL(url);
}

// Compress
const compressForm = document.getElementById("compressForm");
const compressPdfFile = document.getElementById("compressPdfFile");
const compressionLevel = document.getElementById("compressionLevel");
const compressStatusMessage = document.getElementById("compressStatusMessage");

if (compressForm && compressPdfFile && compressionLevel && compressStatusMessage) {
  compressForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const file = compressPdfFile.files[0];
    const submitButton = compressForm.querySelector('button[type="submit"]');

    if (!file) {
      setMessage(compressStatusMessage, "Please choose a PDF file.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("compressionLevel", compressionLevel.value);

    submitButton.disabled = true;
    setMessage(compressStatusMessage, "Compressing PDF...", "info");

    try {
      const response = await fetch("/api/pdf/compress", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        setMessage(
          compressStatusMessage,
          errorData.message || "Failed to compress PDF.",
          "error"
        );
        return;
      }

      const blob = await response.blob();
      const filename = getFilenameFromResponse(
        response,
        "compressed_GoPDFNow.com.au.pdf"
      );

      triggerDownload(blob, filename);
      setMessage(compressStatusMessage, "Compressed successfully. Download started.", "success");
    } catch (error) {
      console.error("Compress fetch error:", error);
      setMessage(compressStatusMessage, "Something went wrong. Please try again.", "error");
    } finally {
      submitButton.disabled = false;
    }
  });
}

// Merge
const mergeForm = document.getElementById("mergeForm");
const pdfFiles = document.getElementById("pdfFiles");
const statusMessage = document.getElementById("statusMessage");

if (mergeForm && pdfFiles && statusMessage) {
  mergeForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const files = pdfFiles.files;
    const submitButton = mergeForm.querySelector('button[type="submit"]');

    if (!files || files.length < 2) {
      setMessage(statusMessage, "Please select at least 2 PDF files.", "error");
      return;
    }

    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    submitButton.disabled = true;
    setMessage(statusMessage, "Merging PDFs...", "info");

    try {
      const response = await fetch("/api/pdf/merge", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        setMessage(statusMessage, errorData.message || "Failed to merge PDF files.", "error");
        return;
      }

      const blob = await response.blob();
      const filename = getFilenameFromResponse(
        response,
        "merged_GoPDFNow.com.au.pdf"
      );

      triggerDownload(blob, filename);
      setMessage(statusMessage, "Merged successfully. Download started.", "success");
    } catch (error) {
      console.error("Merge fetch error:", error);
      setMessage(statusMessage, "Something went wrong. Please try again.", "error");
    } finally {
      submitButton.disabled = false;
    }
  });
}

// Waitlist
const waitlistForm = document.getElementById("waitlistForm");
const emailInput = document.getElementById("emailInput");
const waitlistMessage = document.getElementById("waitlistMessage");

if (waitlistForm && emailInput && waitlistMessage) {
  waitlistForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    const submitButton = waitlistForm.querySelector('button[type="submit"]');

    if (!email) {
      setMessage(waitlistMessage, "Please enter your email.", "error");
      return;
    }

    submitButton.disabled = true;
    setMessage(waitlistMessage, "Saving your request...", "info");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          source: "pdf-to-word"
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(waitlistMessage, data.message || "Could not save your email.", "error");
        return;
      }

      waitlistForm.reset();
      setMessage(waitlistMessage, "Thank you. We will notify you when PDF to Word is live.", "success");
    } catch (error) {
      console.error("Waitlist error:", error);
      setMessage(waitlistMessage, "Could not save your email. Please try again.", "error");
    } finally {
      submitButton.disabled = false;
    }
  });
}