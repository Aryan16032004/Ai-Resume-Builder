import puppeteer from 'puppeteer';

const generatePdf = async (htmlContent) => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ]
  });

  try {
    const page = await browser.newPage();
    
    // Set viewport to match A4 paper size
    await page.setViewport({
      width: 1200,
      height: 1696, // A4 aspect ratio
      deviceScaleFactor: 2 // For higher quality
    });

    // Add base styles to ensure consistency
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            /* Base reset for consistent printing */
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Times New Roman', Times, serif;
              line-height: 1.5;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          </style>
          ${htmlContent}
        </head>
        <body>
          <div id="resume-content">
            ${htmlContent}
          </div>
        </body>
      </html>
    `, {
      waitUntil: 'networkidle0'
    });

    // Wait for fonts to load if needed
    await page.evaluateHandle('document.fonts.ready');

    // Generate PDF with proper margins
    return await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      },
      preferCSSPageSize: true
    });
  } finally {
    await browser.close();
  }
};

export default generatePdf;