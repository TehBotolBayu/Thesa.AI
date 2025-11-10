export function safeParseArray(value, fieldName = "unknown") {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    if (Array.isArray(value)) return value;
    console.warn(`⚠️ Failed to parse ${fieldName}, defaulting to []`);
    return [];
  }
}


// Custom link renderer for ReactMarkdown
export const LinkRenderer = ({ href, children, ...props }) => {
  const isExternal = href?.startsWith("http") || href?.startsWith("https");

  return (
    <a
      href={href}
      target={isExternal ? "_blank" : "_self"}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="text-blue-400 hover:text-blue-300 underline transition-colors duration-200"
      {...props}
    >
      {children}
    </a>
  );
};

export function unicodeToAscii(str) {
  // Step 1: remove accents/diacritics
  let ascii = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  // Step 2: replace non-ASCII characters
  ascii = ascii.replace(/[^\x00-\x7F]/g, "?");
  return ascii;
}
