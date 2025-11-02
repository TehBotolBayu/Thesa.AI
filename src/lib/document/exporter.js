import { marked } from "marked";
import htmlDocx from "html-docx-js/dist/html-docx";

/**
 * Convert Markdown text to DOCX and automatically download in browser.
 * @param {string} markdownText - Markdown content
 * @param {string} fileName - Output file name
 */
export function convertMarkdownToDocx(markdownText, fileName = "document.docx") {
  // Convert markdown → HTML
  const htmlContent = marked(markdownText);

  // Wrap in minimal HTML structure
  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          h1, h2, h3 { color: #333; }
          pre { background: #f4f4f4; padding: 10px; border-radius: 6px; }
          code { background: #f4f4f4; padding: 2px 4px; border-radius: 4px; }
        </style>
      </head>
      <body>${htmlContent}</body>
    </html>
  `;

  // Convert HTML → DOCX
  const blob = htmlDocx.asBlob(htmlTemplate);

  // Trigger file download in browser
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();

  // Cleanup URL object
  URL.revokeObjectURL(link.href);
}
