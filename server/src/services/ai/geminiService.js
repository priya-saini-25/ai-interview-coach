const { GoogleGenAI } = require('@google/genai');

// Initialize Google Gen AI client with environment variable
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Sends extracted resume text to Google Gemini AI for analysis.
 * @param {string} resumeText - The extracted text content from the resume.
 * @returns {Promise<string>} - The raw text response from Gemini AI.
 */
const analyzeResumeWithGemini = async (resumeText) => {
  const modelsToTry = ['gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-flash-latest'];
  const prompt = `Read the following resume and provide a short professional summary in about 100 words.\n\nResume Text:\n${resumeText}`;

  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`Attempting Gemini analysis with model: ${modelName}`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
      });

      return response.text;
    } catch (error) {
      lastError = error;
      const isNotFound =
        error.message?.includes('404') ||
        error.message?.includes('NOT_FOUND') ||
        error.status === 404 ||
        error.code === 404;

      if (isNotFound) {
        console.warn(`Model ${modelName} returned NOT_FOUND. Retrying with fallback model...`);
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
