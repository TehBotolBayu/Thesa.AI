import pdf from "pdf-parse";

export async function extractPdfTextFromUrl(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }

    // Convert to Buffer, NOT file path
    const arrayBuffer = await response.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    const data = await pdf(pdfBuffer);

    return data.text.trim();
  } catch (err) {
    console.error("extractPdfTextFromUrl ERROR:", err);
    return null;
  }
}
