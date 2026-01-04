// Server-side only PDF text extraction
// Using require() to avoid webpack issues

export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  // Dynamic require to avoid webpack bundling issues
  const pdfParse = require("pdf-parse-fork");

  const data = await pdfParse(pdfBuffer);
  return data.text;
}
