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

/**
 * Generates a detailed 6-month placement preparation roadmap using Google Gemini AI.
 * @param {Object} data - Candidate targeting details.
 * @returns {Promise<string>} - The raw JSON string response from Gemini AI.
 */
const generateRoadmapWithGemini = async (data) => {
  const { targetRole, targetCompany, currentYear, currentSkills, targetPackage } = data;

  const modelsToTry = ['gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-flash-latest'];

  const prompt = `You are an expert career coach and technical interview strategist.
Create a comprehensive 6-month preparation roadmap for a candidate with the following profile:
- Target Role: ${targetRole}
- Target Company: ${targetCompany}
- Current Year / Level: ${currentYear}
- Current Skills: ${Array.isArray(currentSkills) ? currentSkills.join(', ') : currentSkills || 'None specified'}
- Target Package: ${targetPackage}

Return ONLY a valid JSON object matching this exact schema:
{
  "roadmap": "A detailed 6-month roadmap in markdown format."
}

Requirements for the "roadmap" markdown content:
- Include a Month-wise plan (Month 1 through Month 6).
- Include Weekly goals for each month.
- Include key Data Structures & Algorithms (DSA) topics.
- Include essential Development topics relevant to ${targetRole}.
- Recommend 2-3 portfolio-ready Projects to build.
- Include Resume milestones and portfolio polishing timelines.
- Include Interview preparation strategies (mock interviews, system design, behavioral prep).
- Provide Company-specific advice tailored for ${targetCompany}.
- Include a dedicated Final revision month plan (Month 6).

Return raw JSON ONLY with no code block fences or extra text.`;

  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`Attempting Gemini roadmap generation with model: ${modelName}`);
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

      throw new Error(`Gemini AI roadmap generation failed with ${modelName}: ${error.message}`);
    }
  }

  console.error('All fallback Gemini models failed:', lastError?.message);
  throw new Error(`Gemini AI roadmap generation failed: ${lastError?.message}`);
};

module.exports = {
  analyzeResumeWithGemini,
  generateRoadmapWithGemini,
};
