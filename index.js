import express from "express";
import bodyParser from "body-parser";
import puppeteer from "puppeteer";

const app = express();
app.use(bodyParser.json({ limit: "10mb" }));

// Feste Firmeninfos für Header
const COMPANY = {
  name: "ALLROUNDER HANDWERKER",
  line1: "Handwerkers Plätzchen",
  line2: "Heringswegchen 12, 16321 Bernau",
  phone: "Telefon: 1234578",
  email: "Email: mopsta@web.de",
  logoUrl: "https://raw.githubusercontent.com/Gudstuv16321/handwerker-offer-pdf/refs/heads/main/logo.png"
};

app.post("/generate-pdf", async (req, res) => {
  try {
    const { html } = req.body;

    if (!html) {
      return res.status(400).send("No HTML provided");
    }

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();

    const styledHtml = `
      <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 30px 30px 60px 30px;
            color: #222;
            line-height: 1.5;
            font-size: 12px;
          }
          .header {
            display: flex;
            align-items: center;
            border-bottom: 3px solid #FF7A00;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .header-logo img {
            height: 70px;
          }
          .header-info {
            margin-left: 20px;
          }
          .company-name {
            font-size: 20px;
            font-weight: 700;
            color: #111;
          }
          .company-line {
            font-size: 11px;
            color: #555;
          }
          h1, h2 {
            color: #FF7A00;
            margin-bottom: 8px;
          }
          h1 {
            font-size: 18px;
          }
          h2 {
            font-size: 14px;
            margin-top: 18px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          th {
            background: #FF7A00;
            color: white;
            padding: 6px;
            text-align: left;
            font-size: 11px;
          }
          td {
            border: 1px solid #ddd;
            padding: 6px;
            font-size: 11px;
          }
          .total-row td {
            font-weight: bold;
          }
          .highlight-box {
            border-left: 4px solid #FF7A00;
            padding: 8px 10px;
            margin: 10px 0;
            background: #FFF7EF;
            font-size: 11px;
          }
          footer {
            position: fixed;
            bottom: 20px;
            left: 30px;
            right: 30px;
            font-size: 9px;
            text-align: center;
            color: #666;
          }
        </style>
      </head>
      <body>

        <div class="header">
          <div class="header-logo">
            <img src="${COMPANY.logoUrl}" />
          </div>
          <div class="header-info">
            <div class="company-name">${COMPANY.name}</div>
            <div class="company-line">${COMPANY.line1}</div>
            <div class="company-line">${COMPANY.line2}</div>
            <div class="company-line">${COMPANY.phone}</div>
            <div class="company-line">${COMPANY.email}</div>
          </div>
        </div>

        ${html}

        <footer>
          Digital erstellt – gültig ohne Unterschrift
        </footer>
      </body>
      </html>
    `;

    await page.setContent(styledHtml, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "90px", bottom: "70px", left: "20px", right: "20px" }
    });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": pdfBuffer.length
    });

    res.send(pdfBuffer);

  } catch (err) {
    console.error(err);
    res.status(500).send("PDF generation failed");
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("PDF service running on port " + port));
