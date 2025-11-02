"use client";

export function changeUrl(urlPath) {
  if (typeof window !== "undefined" && window.history.pushState) {
    window.history.pushState({}, "", urlPath);
  }
}

export function extractNumber(input) {
  // Regex to match a floating-point number:
  // \d+        -> one or more digits (the integer part)
  // (\.\d+)?   -> optional decimal point followed by one or more digits (the fractional part)
  const regex = /\d+(\.\d+)?/; 
  
  // Use match() to find the first occurrence of the pattern
  const matchResult = input.match(regex);
  
  // Check if a match was found
  if (matchResult) {
    // matchResult[0] is the matched string (e.g., "283.65")
    // parseFloat converts the string to a floating-point number (283.65)
    return parseFloat(matchResult[0]);
  }
  
  // Return NaN if no number is found
  return NaN; 
}