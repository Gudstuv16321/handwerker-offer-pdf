const express = require("express");
const bodyParser = require("body-parser");
const html_to_pdf = require("html-pdf-node");

const app = express();
const PORT = process.env.PORT || 3000;

// Body als JSON einlesen
app.use(bodyParser.json({ limit: "10mb" }));

// einfache Testseite
app.get("/", (req, res) => {
  res.send("PDF service is running (no Chrome needed).");
});

// PDF-Erzeugung
app.post("/generate-pdf", async (req, res) => {
  try {
    const html = req.body?.html;
    if (!html || typeof html !== "string") {
      return res.status(400).json({ error: "No valid 'html' found" });
    }

    const file = { content: html };

    const pdfBuffer = await html_to_pdf.generatePdf(file, {
      format: "A4",
      printBackground: true
    });

    console.log("PDF created, size:", pdfBuffer.length);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="angebot.pdf"',
      "Content-Length": pdfBuffer.length
    });

    return res.send(pdfBuffer);

  } catch (err) {
    console.error("PDF generation error:", err);
    return res.status(500).json({
      error: "PDF generation failed",
      details: err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 PDF service running on port ${PORT}`);
});
