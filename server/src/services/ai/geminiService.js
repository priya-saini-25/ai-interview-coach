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
          temperature: 0,
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
        errMsg.includes('429') ||
        errMsg.includes('quota') ||
        errMsg.includes('resource_exhausted') ||
        errMsg.includes('rate limit') ||
        status === 404 ||
        status === 503 ||
        status === 429;

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
        errMsg.includes('429') ||
        errMsg.includes('quota') ||
        errMsg.includes('resource_exhausted') ||
        errMsg.includes('rate limit') ||
        status === 404 ||
        status === 503 ||
        status === 429;

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
 * Generates 15 interview questions across 4 sections using Google Gemini AI.
 * @param {Object} data - Interview parameters ({ role, difficulty, company }).
 * @returns {Promise<string>} - Raw JSON string from Gemini AI with questions array.
 */
const generateInterviewQuestions = async (data) => {
  const { role, difficulty, company } = data;

  const modelsToTry = ['gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-flash-latest'];

  const prompt = `You are an expert technical interviewer and HR director.
Generate exactly 15 interview questions divided across 4 distinct sections for a candidate applying for the role of "${role}"${company ? ` at "${company}"` : ''} with difficulty level "${difficulty || 'Medium'}":
- Section 1: Technical (5 questions)
- Section 2: Logical / Problem Solving (3 questions)
- Section 3: Personal / Introduction (3 questions)
- Section 4: HR / Behavioral (4 questions)

Return ONLY a valid JSON object matching this exact schema:
{
  "questions": [
    { "id": 1, "section": "Technical", "question": "Technical Question 1..." },
    { "id": 2, "section": "Technical", "question": "Technical Question 2..." },
    { "id": 3, "section": "Technical", "question": "Technical Question 3..." },
    { "id": 4, "section": "Technical", "question": "Technical Question 4..." },
    { "id": 5, "section": "Technical", "question": "Technical Question 5..." },
    { "id": 6, "section": "Logical", "question": "Logical / Problem Solving Question 1..." },
    { "id": 7, "section": "Logical", "question": "Logical / Problem Solving Question 2..." },
    { "id": 8, "section": "Logical", "question": "Logical / Problem Solving Question 3..." },
    { "id": 9, "section": "Personal", "question": "Personal / Introduction Question 1..." },
    { "id": 10, "section": "Personal", "question": "Personal / Introduction Question 2..." },
    { "id": 11, "section": "Personal", "question": "Personal / Introduction Question 3..." },
    { "id": 12, "section": "HR / Behavioral", "question": "HR / Behavioral Question 1..." },
    { "id": 13, "section": "HR / Behavioral", "question": "HR / Behavioral Question 2..." },
    { "id": 14, "section": "HR / Behavioral", "question": "HR / Behavioral Question 3..." },
    { "id": 15, "section": "HR / Behavioral", "question": "HR / Behavioral Question 4..." }
  ]
}

Instructions:
- The "questions" array must contain EXACTLY 15 clear, relevant, and realistic interview questions tailored to the specified role, difficulty, and company.
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
        errMsg.includes('429') ||
        errMsg.includes('quota') ||
        errMsg.includes('resource_exhausted') ||
        errMsg.includes('rate limit') ||
        status === 404 ||
        status === 503 ||
        status === 429;

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
 * @returns {Promise<string>} - Raw JSON string from Gemini AI with score, sectionScores, feedback array, and detailedAnalysis.
 */
const evaluateInterviewAnswers = async (data) => {
  const { role, difficulty, company, questions, answers } = data;

  const modelsToTry = ['gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-flash-latest'];

  const qaFormatted = questions
    .map((q, i) => {
      const qText = typeof q === 'object' && q.question ? `[${q.section || 'General'}] ${q.question}` : String(q);
      return `Q${i + 1}: ${qText}\nCandidate Answer: ${answers[i] || 'No answer provided.'}`;
    })
    .join('\n\n');

  const prompt = `You are an expert technical interviewer evaluating a candidate's responses for a "${role}" position${company ? ` at "${company}"` : ''} (Difficulty: "${difficulty || 'Medium'}").

Here are the questions and candidate answers:

${qaFormatted}

Evaluate the candidate's performance across all sections and return ONLY a valid JSON object matching this exact schema:
{
  "score": 82,
  "sectionScores": {
    "technical": 80,
    "logical": 85,
    "personal": 90,
    "hr": 78
  },
  "feedback": [
    "Feedback for Question 1...",
    "Feedback for Question 2..."
  ],
  "strengths": [
    "Clear architectural explanations in Technical round",
    "Polished self-introduction and project breakdown"
  ],
  "weaknesses": [
    "Needs more quantitative metric examples in Behavioral questions",
    "Missed edge case analysis in Logical problem solving"
  ],
  "recommendations": [
    "Use STAR method (Situation, Task, Action, Result) for HR scenarios",
    "Practice binary search and dynamic programming optimization"
  ],
  "questionsToImprove": [
    "Q3 (Technical): Deepen knowledge of async error handling",
    "Q13 (HR / Behavioral): Detail how conflict resolution led to successful outcome"
  ],
  "overallReadiness": "Strong Candidate - Recommended for Final Rounds"
}

Instructions:
- "score" must be an integer between 0 and 100 representing the overall performance score.
- "sectionScores" must contain integers (0-100) for "technical", "logical", "personal", and "hr".
- "feedback" must contain concise, constructive feedback strings evaluating each question individually.
- "strengths", "weaknesses", "recommendations", and "questionsToImprove" must each be an array of 2-4 actionable bullet strings.
- "overallReadiness" must be a single summary verdict string.
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
        errMsg.includes('429') ||
        errMsg.includes('quota') ||
        errMsg.includes('resource_exhausted') ||
        errMsg.includes('rate limit') ||
        status === 404 ||
        status === 503 ||
        status === 429;

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

/**
 * Chat with AI Placement Mentor using Google Gemini AI.
 * @param {Object} params - { userContext, chatHistory, userMessage }
 * @returns {Promise<string>} - Assistant Markdown response text.
 */
const chatWithMentorWithGemini = async ({ userContext, chatHistory = [], userMessage }) => {
  const modelsToTry = ['gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-flash-latest'];

  const { profile, resume, roadmap, dsa, interviews, readinessScore } = userContext;

  const formattedHistory = chatHistory
    .map((msg) => `${msg.role === 'user' ? 'Candidate' : 'AI Mentor'}: ${msg.content}`)
    .join('\n\n');

  const prompt = `You are an experienced, empathetic software engineering placement mentor helping an engineering candidate prepare for tech placement, internships, and entry-level developer roles.

CANDIDATE PLACEMENT CONTEXT:
- Candidate Name: ${profile.name || 'Candidate'}
- Target Role: ${profile.targetRole || 'Software Engineer (Not specified)'}
- Target Company: ${profile.targetCompany || 'General Tech Companies'}
- Overall Placement Readiness Score: ${readinessScore}/100
- ATS Resume Score: ${resume.hasResume ? `${resume.atsScore}/100` : 'Resume Not Uploaded Yet'}
  * Key Strengths: ${resume.strengths && resume.strengths.length > 0 ? resume.strengths.join('; ') : 'None recorded'}
  * Key Weaknesses / Missing Skills: ${resume.missingSkills && resume.missingSkills.length > 0 ? resume.missingSkills.join('; ') : 'None recorded'}
- Roadmap Generated: ${roadmap.generated ? 'Yes (6-month plan ready)' : 'No'}
- Data Structures & Algorithms (DSA): ${dsa.solvedCount}/${dsa.totalProblems} solved (${dsa.completionPercentage}% completion rate), ${dsa.savedForRevisionCount} saved for revision. (Breakdown: Easy: ${dsa.easySolved}, Medium: ${dsa.mediumSolved}, Hard: ${dsa.hardSolved})
- Mock Interview History: ${interviews.completedSessionsCount} sessions completed, average score: ${interviews.averageScore}/100.

MENTOR INSTRUCTIONS:
- Give practical, encouraging, and highly specific guidance tailored to the candidate's target role (${profile.targetRole || 'Software Engineering'}) and target company (${profile.targetCompany || 'General'}).
- Reference the candidate's actual metrics (e.g. DSA progress, ATS score, mock interview score) when answering questions about readiness or next steps.
- If the candidate asks about company preparation, use realistic and cautious wording (e.g., "Common interview patterns reported for ${profile.targetCompany || 'this company'} include...").
- Offer actionable next steps (e.g., 7-day action plan, specific DSA topics, resume tweaks, or mock interview recommendations).
- Format your response clearly in rich Markdown using bullet points, bold key terms, numbered steps, and code snippets when explaining DSA concepts.
- Keep responses engaging, structured, and easy to read.

${formattedHistory ? `RECENT CONVERSATION HISTORY:\n${formattedHistory}\n\n` : ''}Candidate Question:
${userMessage}`;

  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`Attempting Gemini AI mentor chat with model: ${modelName}`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
      });

      const replyText = response.text ? response.text.trim() : '';
      if (!replyText) {
        throw new Error('Gemini returned an empty response.');
      }

      return replyText;
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
        errMsg.includes('429') ||
        errMsg.includes('quota') ||
        errMsg.includes('resource_exhausted') ||
        errMsg.includes('rate limit') ||
        status === 404 ||
        status === 503 ||
        status === 429;

      if (isUnavailableOrNotFound) {
        console.warn(`Model ${modelName} unavailable for mentor chat. Trying fallback model...`);
        continue;
      }

      throw new Error(`Gemini AI mentor chat failed with ${modelName}: ${error.message}`);
    }
  }

  console.error('All fallback Gemini models failed for mentor chat:', lastError?.message);
  throw new Error(`Gemini AI mentor chat failed: ${lastError?.message}`);
};

module.exports = {
  analyzeResumeWithGemini,
  generateRoadmapWithGemini,
  generateInterviewQuestions,
  evaluateInterviewAnswers,
  chatWithMentorWithGemini,
};
