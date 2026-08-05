const { GoogleGenAI } = require('@google/genai');

// Initialize Google Gen AI client with environment variable
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Sends extracted resume text to Google Gemini AI for structured analysis.
 * @param {string} resumeText - The extracted text content from the resume.
 * @returns {Promise<string>} - The raw JSON string response from Gemini AI.
 */
const analyzeResumeWithGemini = async (resumeText) => {
  const modelsToTry = ['gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-flash-latest'];

  const prompt = `You are an expert AI resume reviewer and ATS optimization specialist.
Analyze the following resume and return ONLY a valid JSON object matching this exact schema:

{
  "overallScore": number,
  "strengths": [string],
  "weaknesses": [string],
  "missingSkills": [string],
  "atsSuggestions": [string],
  "improvementSuggestions": [string]
}

Instructions:
- "overallScore" must be an integer between 0 and 100 based on overall resume quality and market readiness.
- "strengths", "weaknesses", "missingSkills", "atsSuggestions", and "improvementSuggestions" must each be an array of 3 to 5 concise, actionable strings.
- Do NOT include any markdown formatting, code block fences (such as \`\`\`json), or conversational text.
- Return raw JSON ONLY.

Resume Text:
${resumeText}`;

  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`Attempting Gemini analysis with model: ${modelName}`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      let rawResponse = response.text ? response.text.trim() : '';
      rawResponse = rawResponse.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '').trim();

      return rawResponse;
    } catch (error) {
      lastError = error;

      const errMsg = (error.message || '').toLowerCase();
      const status = error.status || error.code;

      const isUnavailableOrNotFound =
        errMsg.includes('404') ||
        errMsg.includes('not_found') ||
        errMsg.includes('503') ||
        errMsg.includes('unavailable') ||
        errMsg.includes('high demand') ||
        errMsg.includes('try again later') ||
        status === 404 ||
        status === 503;

      if (isUnavailableOrNotFound) {
        console.warn(`Model ${modelName} unavailable. Trying fallback model...`);
        continue;
      }

      throw new Error(`Gemini AI analysis failed with ${modelName}: ${error.message}`);
    }
  }

  console.error('All fallback Gemini models failed:', lastError?.message);
  throw new Error(`Gemini AI analysis failed: ${lastError?.message}`);
};

module.exports = {
  analyzeResumeWithGemini,
};
