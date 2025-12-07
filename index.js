// index.js
// Minimaler HTML->PDF-Service für Render + n8n

const express = require("express");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer");

const app = express();
const PORT = process.env.PORT || 3000;

// Body als JSON einlesen
app.use(bodyParser.json({ limit: "5mb" }));

// einfache Health-Route für Tests im Browser
app.get("/", (req, res) => {
  res.send("Handwerker PDF service is running.");
});

// Haupt-Route: erzeugt aus HTML ein PDF
app.post("/generate-pdf", async (req, res) => {
  try {
    const html = req.body && req.body.html;

    if (!html || typeof html !== "string") {
      return res.status(400).json({
        error: "No valid 'html' field found in request body."
      });
    }

    console.log("📄 Incoming HTML length:", html.length);

    // Puppeteer starten – wichtig für Render: no-sandbox!
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();

    // HTML setzen
    await page.setContent(html, {
      waitUntil: "networkidle0"
    });

    // PDF generieren
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        right: "15mm",
        bottom: "20mm",
        left: "15mm"
      }
    });

    await browser.close();

    console.log("✅ PDF generated, size:", pdfBuffer.length, "bytes");

    // PDF zurückgeben
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="angebot.pdf"',
      "Content-Length": pdfBuffer.length
    });

    return res.send(pdfBuffer);
  } catch (err) {
    console.error("❌ PDF generation error:", err);
    return res.status(500).json({
      error: "PDF generation failed",
      details: err.message || String(err)
    });
  }
});

// Server starten
app.listen(PORT, () => {
  console.log(`🚀 PDF service listening on port ${PORT}`);
});
