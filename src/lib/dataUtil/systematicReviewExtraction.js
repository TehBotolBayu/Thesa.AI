export function flattenExtractedData(input) {
  const result = {
    paperId: input.paperId,
    success: input.success,
  };

  input.data.forEach((item) => {
    // Convert label to lowerCamelCase or any format you want
    const key = item.label.trim().toLowerCase();
    result[key] = item.value;
  });

  return result;
}
