import { getGeminiCompletion } from './geminiApi.js';

export async function parseResumeWithGemini(resumetext) {
    try {
         const prompt = `
      Analyze this resume and extract the following information in JSON format:
      {
        "skills": ["array", "of", "technical", "skills"],
        "projects": [
          {
            "name": "project name",
            "description": "brief description",
            "technologies": ["array", "of", "tech", "used"]
          }
        ],
        "experience": "years of experience if mentioned"
      }
      Be precise and only include information explicitly mentioned in the resume.
      This is the resume text that had to be Analyze: ${resumetext}
    `;

    const response = await getGeminiCompletion(prompt)
    console.log('Gemini response:', response);
    const sanitized = response.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
    return JSON.parse(sanitized);
    } catch (error) {
        console.error('Gemini parsing failed:', error);
        throw new Error(`Failed to process Gemini response: ${error.message}`);
    }
}