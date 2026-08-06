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

/**
 * Generates 5 interview questions using Google Gemini AI based on role, difficulty, and company.
 * @param {Object} data - Interview parameters ({ role, difficulty, company }).
 * @returns {Promise<string>} - Raw JSON string from Gemini AI with questions array.
 */
const generateInterviewQuestions = async (data) => {
  const { role, difficulty, company } = data;

  const modelsToTry = ['gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-flash-latest'];

  const prompt = `You are an expert technical interviewer.
Generate exactly 5 interview questions for a candidate applying for the role of "${role}"${company ? ` at "${company}"` : ''} with difficulty level "${difficulty || 'Medium'}".

Return ONLY a valid JSON object matching this exact schema:
{
  "questions": [
    "Question 1...",
    "Question 2...",
    "Question 3...",
    "Question 4...",
    "Question 5..."
  ]
}

Instructions:
- The "questions" array must contain EXACTLY 5 clear, relevant, and realistic interview questions tailored to the specified role, difficulty, and company.
- Do NOT include any markdown formatting, code block fences (such as \`\`\`json), or conversational text.
- Return raw JSON ONLY.`;

  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`Attempting Gemini interview questions generation with model: ${modelName}`);
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

      throw new Error(`Gemini AI question generation failed with ${modelName}: ${error.message}`);
    }
  }

  console.error('All fallback Gemini models failed:', lastError?.message);
  throw new Error(`Gemini AI question generation failed: ${lastError?.message}`);
};

/**
 * Evaluates candidate interview answers using Google Gemini AI.
 * @param {Object} data - Questions and candidate answers along with context ({ role, difficulty, company, questions, answers }).
 * @returns {Promise<string>} - Raw JSON string from Gemini AI with score and feedback array.
 */
const evaluateInterviewAnswers = async (data) => {
  const { role, difficulty, company, questions, answers } = data;

  const modelsToTry = ['gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-flash-latest'];

  const qaFormatted = questions
    .map((q, i) => `Q${i + 1}: ${q}\nCandidate Answer: ${answers[i] || 'No answer provided.'}`)
    .join('\n\n');

  const prompt = `You are an expert technical interviewer evaluating a candidate's responses for a "${role}" position${company ? ` at "${company}"` : ''} (Difficulty: "${difficulty || 'Medium'}").

Here are the questions and candidate answers:

${qaFormatted}

Evaluate the candidate's answers overall and return ONLY a valid JSON object matching this exact schema:
{
  "score": 82,
  "feedback": [
    "Feedback for Question 1...",
    "Feedback for Question 2...",
    "Feedback for Question 3...",
    "Feedback for Question 4...",
    "Feedback for Question 5..."
  ]
}

Instructions:
- "score" must be an integer between 0 and 100 representing the overall interview performance score based on accuracy, depth, clarity, and relevance.
- "feedback" must be an array of 5 concise, constructive, and actionable feedback strings evaluating each question's answer individually.
- Do NOT include any markdown formatting, code block fences (such as \`\`\`json), or conversational text.
- Return raw JSON ONLY.`;

  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`Attempting Gemini interview evaluation with model: ${modelName}`);
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

      throw new Error(`Gemini AI evaluation failed with ${modelName}: ${error.message}`);
    }
  }

  console.error('All fallback Gemini models failed:', lastError?.message);
  throw new Error(`Gemini AI evaluation failed: ${lastError?.message}`);
};

module.exports = {
  analyzeResumeWithGemini,
  generateRoadmapWithGemini,
  generateInterviewQuestions,
  evaluateInterviewAnswers,
};
