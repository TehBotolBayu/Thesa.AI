import pdf from "pdf-parse";

export async function extractPdfTextFromUrl(url) {
  try {
    const response = await fetch(url, {
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: HTTP ${response.status} - ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("application/pdf")) {
      throw new Error(`URL does not return a PDF file. Content-Type returned: ${contentType}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    const parsed = await pdf(pdfBuffer);

    return parsed.text.trim();
  } catch (err) {
    console.error("extractPdfTextFromUrl ERROR:", err);
    return null;
  }
}
