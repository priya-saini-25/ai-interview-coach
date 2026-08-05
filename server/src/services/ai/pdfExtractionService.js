// Polyfill for DOMMatrix which is required by pdf-parse on Node 21+
if (typeof global.DOMMatrix === 'undefined') {
  global.DOMMatrix = class DOMMatrix { };
}
const { PDFParse } = require('pdf-parse');

/**
 * Downloads a PDF from a given URL and extracts all readable text.
 * @param {string} pdfUrl - The secure URL of the PDF (e.g., from Cloudinary)
 * @returns {Promise<string>} - The extracted raw text from the PDF
 */
const extractTextFromPDF = async (pdfUrl) => {
  try {
    // 1. Fetch the PDF file from the remote URL using native fetch (Node 18+)
    const response = await fetch(pdfUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch PDF from Cloudinary. Status: ${response.status}`);
    }

    // 2. Convert the response into a Node.js Buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Parse the PDF buffer to extract text
    const parser = new PDFParse({ data: buffer });
    const data = await parser.getText();

    // 4. Return the extracted text
    const rawText = data.text ? data.text.trim() : '';

    if (!rawText) {
      throw new Error('No readable text found in the PDF.');
    }

    return rawText;
  } catch (error) {
    // Re-throw so the controller can catch it
    throw new Error(`PDF Extraction failed: ${error.message}`);
  }
};

module.exports = {
  extractTextFromPDF,
};
