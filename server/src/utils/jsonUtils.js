/**
 * Safely extracts and parses JSON object or array from a string returned by AI models.
 * Handles markdown block fences (```json ... ```), surrounding text, trailing commas, and whitespace.
 *
 * @param {string} text - Raw output string from AI model
 * @returns {any} - Parsed JavaScript object or array
 * @throws {Error} - If valid JSON cannot be extracted or parsed
 */
const safeParseAIJson = (text) => {
  if (!text || typeof text !== 'string') {
    throw new Error('Empty or non-string AI response received.');
  }

  let cleaned = text.trim();

  // 1. Remove markdown code fences if present anywhere in the string
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch && fenceMatch[1]) {
    cleaned = fenceMatch[1].trim();
  }

  // Helper function to strip trailing commas before closing braces/brackets
  const stripTrailingCommas = (str) => str.replace(/,\s*([}\]])/g, '$1');

  // 2. Try direct JSON.parse
  try {
    return JSON.parse(cleaned);
  } catch (e1) {
    // Continue to fallback strategies
  }

  // 3. Try removing trailing commas
  try {
    return JSON.parse(stripTrailingCommas(cleaned));
  } catch (e2) {
    // Continue to bracket extraction
  }

  // 4. Locate outermost JSON object {...} or array [...]
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  const firstBracket = cleaned.indexOf('[');
  const lastBracket = cleaned.lastIndexOf(']');

  const hasBrace = firstBrace !== -1 && lastBrace > firstBrace;
  const hasBracket = firstBracket !== -1 && lastBracket > firstBracket;

  let extracted = null;

  if (hasBrace && (!hasBracket || firstBrace < firstBracket)) {
    extracted = cleaned.slice(firstBrace, lastBrace + 1);
  } else if (hasBracket) {
    extracted = cleaned.slice(firstBracket, lastBracket + 1);
  }

  if (extracted) {
    try {
      return JSON.parse(extracted);
    } catch (e3) {
      try {
        return JSON.parse(stripTrailingCommas(extracted));
      } catch (e4) {
        // Fall through to throw
      }
    }
  }

  throw new Error('Unable to extract or parse valid JSON from AI response.');
};

module.exports = {
  safeParseAIJson,
};
