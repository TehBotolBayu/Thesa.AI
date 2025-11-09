export class URLDetector {
  constructor() {
    // Comprehensive URL regex pattern
    this.urlPattern =
      /(?:(?:https?|ftp|ftps):\/\/)?(?:www\.)?(?:[\w-]+\.)+[a-z]{2,}(?:\/[^\s]*)?/gi;
    this.protocolPattern = /^(https?|ftp|ftps):\/\//i;
  }

  // Extract all URLs from text
  extractUrls(text) {
    if (!text || typeof text !== "string") return [];
    const matches = text.match(this.urlPattern) || [];
    return [...new Set(matches)]; // Remove duplicates
  }

  // Validate if a string is a valid URL
  isValidUrl(url) {
    if (!url || typeof url !== "string") return false;
    try {
      const urlToTest = this.protocolPattern.test(url) ? url : `https://${url}`;
      const urlObj = new URL(urlToTest);
      return (
        urlObj.protocol === "http:" ||
        urlObj.protocol === "https:" ||
        urlObj.protocol === "ftp:" ||
        urlObj.protocol === "ftps:"
      );
    } catch (error) {
      return false;
    }
  }

  // Convert URLs to proper format
  normalizeUrl(url) {
    if (this.protocolPattern.test(url)) return url;
    return `https://${url}`;
  }

  // Convert plain text URLs to markdown links
  convertUrlsToMarkdown(text) {
    if (!text) return text;

    // Find all URLs in the text
    const urls = this.extractUrls(text);
    let result = text;

    urls.forEach((url) => {
      if (this.isValidUrl(url)) {
        const normalizedUrl = this.normalizeUrl(url);
        // Only convert if it's not already a markdown link
        const linkPattern = new RegExp(
          `\\[.*?\\]\\(.*?${url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}.*?\\)`,
          "gi"
        );

        if (!linkPattern.test(result)) {
          // Replace plain URL with markdown link
          const urlRegex = new RegExp(
            url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            "gi"
          );
          result = result.replace(urlRegex, `[${url}](${normalizedUrl})`);
        }
      }
    });

    return result;
  }
}

export function normalizeMath(content) {
  return content
    .replace(/\\\[(.*?)\\\]/gs, (_, expr) => `$$${expr}$$`)
    .replace(/\\\((.*?)\\\)/gs, (_, expr) => `$${expr}$`);
}
