import express from "express";
import bodyParser from "body-parser";
import puppeteer from "puppeteer";

const app = express();

// JSON UND FormData UND raw text akzeptieren:
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app.use(bodyParser.text({ type: "text/html" }));

app.post("/generate-pdf", async (req, res) => {
  try {
    // HTML aus allen möglichen Quellen:
    const html =
      req.body?.html ||
      req.body ||
      req?.rawBody ||
      "";

    if (!html || html.trim() === "") {
      return res.status(400).json({ error: "No HTML provided" });
    }

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.send(pdf);
  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).json({ error: "PDF generation failed" });
  }
});

app.listen(3000, () => console.log("PDF service running"));
