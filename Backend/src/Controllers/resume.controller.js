import { Resume } from "../Models/ResumeModels.js";
import { User } from "../Models/UserModel.js";
import generatePdf from "../pdfgenerator.js";
import { uploadOnCloudinary } from "../Cloudinary.js";
import { extractTextFromDocx, extractTextFromPDF } from "../extractResumeText.js";
import { getGeminiCompletion } from "../geminiApi.js";
import fs from 'fs/promises';
import { parseResumeWithGemini } from "../resumeParser.js";
import executeCode from "../judge0.js";
import { UserProfile } from "../Models/UserProfile.js";


export const saveResumeData = async (req, res) => {
  try {
    const userId = req.user._id;
    const { resumeData, resumeId } = req.body;
    // console.log("Received resume data:", resumeData, "for user:", userId);

     const completeSkills = {
      languages: resumeData.skills?.languages || [],
      frameworks: resumeData.skills?.frameworks || [],
      tools: resumeData.skills?.toolsplatforms || [],
      softSkills: resumeData.skills?.softSkills || []
    };

     const update = {
      ...resumeData,
      skills: completeSkills
    };

    //  if (req.file?.path) {
    //   const profileImage = await uploadOnCloudinary(req.file.path);
    //   if (profileImage?.url) {
    //     update.profileImage = profileImage.url;
    //   }
    // }

    let resume;
    
    if (resumeId) {
      // Update existing resume
      resume = await Resume.findOneAndUpdate(
        { _id: resumeId, user: userId },
        { $set: resumeData },
        { new: true, runValidators: true }
      );
      
      if (!resume) {
        return res.status(404).json({
          success: false,
          message: 'Resume not found or not owned by user'
        });
      }
    } else {
      // Create new resume
      resume = new Resume({
        user: userId,
        ...resumeData,
        name: resumeData.name || 'Untitled Resume' // Add name field
      });
      await resume.save();

      await User.findByIdAndUpdate(
        userId,
        { $push: { resumes: resume._id } },
        { new: true }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Resume saved successfully',
      data: resume
    });

  } catch (error) {
    console.error('Error saving resume:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save resume',
      error: error.message
    });
  }
};

export const createResume = async (req, res) => {
  try {

    if (!req.user || !req.user._id) {
      console.log("User is not authenticated or user._id is missing");
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // console.log(req.body);
    

    const resume = new Resume({
      user: req.user._id,
      name: req.body.name || 'Untitled Resume',
      templateName: req.body.templateName
    });


    await resume.save();

    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { resumes: resume._id } },
      { new: true }
    );

    res.json({ success: true, data: resume });
  } catch (error) {
    console.error("Error in createResume controller:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getResumesId = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }
    
    res.json({ success: true, data: resume });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export const getAllResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user._id });
    res.json({ success: true, data: resumes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export const deleteResume = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const deletedResume = await Resume.findOneAndDelete({
      _id: id,
      user: userId
    });

    if (!deletedResume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found or not owned by user'
      });
    }
    
    await User.findByIdAndUpdate(
      userId,
      { $pull: { resumes: id } }
    );

    res.json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete resume',
      error: error.message
    });
  }
};

export const generateResumePdf = async (req, res) => {
  try {
    const { html } = req.body;
    console.log("Received request to generate PDF.");
    // console.log("Request body:", req.body);

    if (!html) {
      console.error("No HTML provided in request body.");
      return res.status(400).json({ error: 'HTML content is required' });
    }

    console.log("HTML content length:", html.length);

    let pdf;
    try {
      pdf = await generatePdf(html, null); // Pass null to get buffer instead of file
      console.log("PDF generated successfully. Buffer size:", pdf.length);
    } catch (pdfErr) {
      console.error("Error in generatePdf():", pdfErr);
      return res.status(500).json({ error: 'Failed to generate PDF in generatePdf' });
    }

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=resume.pdf'
    });

    res.send(pdf);
    console.log("PDF sent to client.");
  } catch (error) {
    console.error('PDF generation error (outer catch):', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
}


export const checkResume = async (req, res) => {
    try {
        const { jobDescription, jobTitle } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'No resume uploaded' });
        }

        // Verify file exists before processing
        // try {
        //     await fs.access(file.path);
        // } catch (err) {
        //     console.error('File access error:', err);
        //     return res.status(500).json({ error: 'Uploaded file could not be accessed' });
        // }

        let resumeText = '';
        try {
            if (file.mimetype === 'application/pdf') {
                // resumeText = await extractTextFromPDF(file.path);
                resumeText = await extractTextFromPDF(file.buffer);
            } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                // resumeText = await extractTextFromDocx(file.path);
                resumeText = await extractTextFromDocx(file.buffer);
            }
        } catch (extractError) {
            console.error('Text extraction failed:', extractError);
            return res.status(500).json({ error: 'Failed to extract text from resume' });
        }

        // // Clean up the uploaded file
        // try {
        //     await fs.unlink(file.path);
        //     console.log('Temporary file deleted:', file.path);
        // } catch (unlinkError) {
        //     console.error('File deletion error:', unlinkError);
        // }

        // Generate prompt and get Gemini response
        const prompt = generatePrompt(jobDescription, jobTitle, resumeText);
        const atsResult = await getGeminiCompletion(prompt);
         const parsedResult = {
            score: extractScore(atsResult),
            keywords: extractKeywords(atsResult),
            improvements: extractImprovements(atsResult)
        };

        res.json(parsedResult);

    } catch (error) {
        console.error('ATS check error:', error);
        
        // Attempt to clean up file if error occurred
        // if (req.file?.path) {
        //     try {
        //         await fs.unlink(req.file.path);
        //     } catch (cleanupError) {
        //         console.error('Cleanup failed:', cleanupError);
        //     }
        // }
        
        res.status(500).json({ 
            error: 'Failed to process resume',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

function generatePrompt(jobDescription, jobTitle, resumeText) {
    if (jobDescription?.trim()) {
        return `Act as an ATS resume checker. Compare the following resume to the job description below.
            - Give an ATS score out of 100.
            - List the top 10 missing or weak keywords/skills from the job description.
            - Suggest specific improvements to make the resume more ATS-friendly for this job.
            Return your answer in this format:
            Score: [score]/100
            Missing Keywords: [comma-separated list]
            Improvements:
            1. [suggestion 1]
            2. [suggestion 2]
            ...
            ---
            Job Description: ${jobDescription}
            ---
            Resume: ${resumeText}`;
    } else if (jobTitle?.trim()) {
        return `Act as an ATS resume checker. Compare the following resume to the requirements for a ${jobTitle} position.
            - Give an ATS score out of 100.
            - List top skills and sections missing for a modern ${jobTitle} role.
            - Suggest specific improvements to make the resume better for this field.
            Return your answer in this format:
            Score: [score]/100
            Missing Keywords: [comma-separated list]
            Improvements:
            1. [suggestion 1]
            2. [suggestion 2]
            ...
            ---
            Resume: ${resumeText}`;
    }
    throw new Error('Either job description or job title is required');
}

function extractScore(text) {
    const match = text.match(/Score:\s*(\d+)\/100/);
    return match ? parseInt(match[1]) : null;
}

function extractKeywords(text) {
    const match = text.match(/Missing Keywords:\s*([^\n]+)/);
    return match ? match[1].split(',').map(k => k.trim()) : [];
}

function extractImprovements(text) {
    // First try to match the improvements section
    const match = text.match(/Improvements:([\s\S]+?)(?:\n\s*\n|$)/i);
    if (!match) return [];

    return match[1].split('\n')
        .filter(line => {
            const trimmed = line.trim();
            // Skip empty lines and section dividers
            return trimmed && !trimmed.startsWith('---');
        })
        .map(line => {
            // Remove all asterisks and clean up the line
            let cleanLine = line.replace(/\*/g, '').trim();
            
            // Remove any numbering if present (1., 2., etc.)
            cleanLine = cleanLine.replace(/^\d+\.\s*/, '').trim();
            
            // Remove semicolons at the end if present
            cleanLine = cleanLine.replace(/;\s*$/, '').trim();
            
            return cleanLine;
        })
        .filter(line => line.length > 0); // Remove any empty lines
}


export const AnalyzeResume = async (req, res) => {
    try {
    // console.log("Received request to analyze resume:", req.body);
    // console.log("File details:", req.file);

    if (!req.file) throw new Error('No file uploaded');
    let resumeText;
    // Detect file type
    if (req.file.mimetype === 'application/pdf') {
      resumeText = await extractTextFromPDF(req.file.buffer);
    } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      resumeText = await extractTextFromDocx(req.file.buffer);
    } else {
      throw new Error('Unsupported file type');
    }
    // console.log("Extracted resume text:", resumeText);

    const parsedData = await parseResumeWithGemini(resumeText);
    // console.log("Parsed resume data:", parsedData);

  const userProfile = new UserProfile({
      ...parsedData,
      jobProfile: req.body.jobProfile,
      salary: req.body.salary,
      difficulty: getDifficultyLevel(parseInt(req.body.salary)),
      resumeText,
    });

    await userProfile.save();
    res.json(userProfile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

function getDifficultyLevel(salary) {
  if (salary < 8) return 'Beginner';
  if (salary <= 16) return 'Intermediate';
  return 'Advanced';
}

export const getAllProfiles = async (req, res) => {
   try {
    const profiles = await UserProfile.find({});
    res.status(200).json(profiles);
  } catch (error) {
    console.error("Error in getAllProfiles:", error);
    res.status(500).json({ 
      error: "Internal server error",
    });
  }
}

export const getAllProfilesId = async (req, res) => {
    try {
    const profile = await UserProfile.findById(req.params.id);
    console.log("Fetching profile with ID:", req.params.id);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export const deleteProfile = async (req, res) => {
  try {
    const { id } = req.params;
    
    const profile = await UserProfile.findById(id);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    await UserProfile.findByIdAndDelete(id);
    
    res.status(200).json({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ 
      error: 'Failed to delete profile',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


export const generateDsaQuestions = async (req, res) => {
  try {
    const { difficulty } = req.body;
    const prompt = `
        Generate 4 Data Structures and Algorithms questions for a ${difficulty} level candidate.
        For each question provide:
        - title
        - description
        - testCases (array of {input, output, explanation})
        - constraints
        - timeLimit (in minutes, based on difficulty)
        
        Format the response as JSON with this structure:
        {
          "questions": [
            {
              "title": "Question title",
              "description": "Detailed problem statement",
              "testCases": [
                {
                  "input": "sample input",
                  "output": "expected output",
                  "explanation": "optional explanation"
                }
              ],
              "constraints": [...],
              "timeLimit": 15
            },
            ...
          ]
        }
      `;
  
      const result = await getGeminiCompletion(prompt);
      console.log("Generated DSA questions:", result);
      
      const jsonStart = result.indexOf('{');
      const jsonEnd = result.lastIndexOf('}') + 1;
      const jsonString = result.slice(jsonStart, jsonEnd);

      res.json(JSON.parse(jsonString));
      
      
  } catch (error) {
    console.error('Error generating DSA questions:', error);
    res.status(500).json({ error: 'Failed to generate DSA questions' });
    
  }
}

export const evaluateDsaCode = async (req, res) => {
  try {
    const { question, code, language } = req.body;

    // Ensure testCases exists and is an array
    const testCases = question.testCases || [];
    
    const executionResults = await executeCode({
      code,
      language,
      testCases
    });

    // If no test cases, still evaluate based on code quality
    if (testCases.length === 0) {
      const prompt = `
        Evaluate this coding solution based on:
        - Code quality
        - Time complexity analysis
        - Space complexity analysis
        - Alternative approaches
        
        Provide detailed feedback and a score out of 25.
        Format as JSON:
        {
          "score": number,
          "correctness": "string",
          "complexity": "string",
          "quality": "string",
          "alternatives": "string"
        }
        
        Question:
        ${JSON.stringify(question)}
        
        Code:
        ${code}
      `;

      const result = await getGeminiCompletion(prompt);
      const jsonStart = result.indexOf('{');
      const jsonEnd = result.lastIndexOf('}') + 1;
      const jsonString = result.slice(jsonStart, jsonEnd);

      return res.json(JSON.parse(jsonString));
    }

    // Normal evaluation with test cases
    const prompt = `
      Evaluate this coding solution based on:
      - Correctness (${executionResults.passedTests}/${executionResults.totalTests} test cases passed)
      - Time complexity
      - Space complexity
      - Code quality
      - Alternative approaches
      
      Provide detailed feedback and a score out of 25.
      Format as JSON:
      {
        "score": number,
        "correctness": string,
        "complexity": string,
        "quality": string,
        "alternatives": string
      }
      
      Question:
      ${JSON.stringify(question)}
      
      Code:
      ${code}
      
      Test Results:
      ${JSON.stringify(executionResults)}
    `;

    const result = await getGeminiCompletion(prompt);
    const jsonStart = result.indexOf('{');
    const jsonEnd = result.lastIndexOf('}') + 1;
    const jsonString = result.slice(jsonStart, jsonEnd);

    res.json(JSON.parse(jsonString));
  } catch (error) {
    console.error('Error evaluating DSA code:', error);
    res.status(500).json({ 
      error: 'Failed to evaluate DSA code',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export const generateTechnicalQuestions = async (req, res) => {
  try {
    const { skills, difficulty } = req.body;
    const questionCount = difficulty === 'Beginner' ? 4 : difficulty === 'Intermediate' ? 6 : 8;
     const prompt = `
      Generate ${questionCount} technical interview questions focusing on these skills: ${skills.join(', ')}.
      The difficulty level should be ${difficulty}.
      
      Include a mix of:
      - Conceptual questions (theory, definitions)
      - Practical scenarios (how would you solve X problem)
      - Problem-solving questions
      
      For each question specify:
      - question (the actual question text)
      - type (conceptual/practical/problem-solving)
      - context (additional context if needed)
      
      Format as JSON:
      {
        "questions": [
          {
            "question": "string",
            "type": "string",
            "context": "string"
          },
          ...
        ]
      }
    `;

    const result = await getGeminiCompletion(prompt);
    const jsonStart = result.indexOf('{');
    const jsonEnd = result.lastIndexOf('}') + 1;
    const jsonString = result.slice(jsonStart, jsonEnd);
    res.json(JSON.parse(jsonString));
  } catch (error) {
    console.error('Error generating technical questions:', error);
    res.status(500).json({ error: 'Failed to generate technical questions' });
    
  }
}

export const evaluateTechnicalAnswer = async (req, res) => {
  try {
    const { question, answer } = req.body;
     const prompt = `
      Evaluate this technical interview answer against the question.
      Provide detailed feedback including:
      - accuracy (is the answer technically correct?)
      - depth (does it show deep understanding?)
      - communication (is it clearly articulated?)
      - suggestions for improvement
      
      Format the response as JSON:
      {
        "accuracy": "string",
        "depth": "string",
        "communication": "string",
        "suggestions": "string"
      }
      
      Question:
      ${JSON.stringify(question)}
      
      Answer:
      ${answer}
    `;

    const result = await getGeminiCompletion(prompt);
    const jsonStart = result.indexOf('{');
    const jsonEnd = result.lastIndexOf('}') + 1;
    const jsonString = result.slice(jsonStart, jsonEnd);
    res.json(JSON.parse(jsonString));
  } catch (error) {
    console.error('Error evaluating technical answer:', error);
    res.status(500).json({ error: 'Failed to evaluate technical answer' });
    
  }
}

export const generateProjectQuestions = async (req, res) => {
  try {
    const { project } = req.body;
     const prompt = `
      Generate 4-10 technical interview questions about this project for a candidate to explain.
      The questions should cover:
      - Overall project explanation
      - Tech stack choices
      - Challenges faced
      - Architecture decisions
      - Impact/outcomes
      - Follow-up technical questions
      
      For each question include:
      - question (the actual question text)
      - context (why this question is important)
      
      Format as JSON:
      {
        "questions": [
          {
            "question": "string",
            "context": "string"
          },
          ...
        ]
      }
      
      Project details:
      ${JSON.stringify(project)}
    `;
    const result = await getGeminiCompletion(prompt);
    const jsonStart = result.indexOf('{');
    const jsonEnd = result.lastIndexOf('}') + 1;
    const jsonString = result.slice(jsonStart, jsonEnd);
    res.json(JSON.parse(jsonString));
  } catch (error) {
    console.error('Error generating project questions:', error);
    res.status(500).json({ error: 'Failed to generate project questions' });
    
  }
}


export const evaluateProjectAnswer = async (req, res) => {
  try {
    const { question, answer } = req.body;
    const prompt = `
      Evaluate this project interview answer against the question.
      Provide detailed feedback including:
      - understanding (does it show good understanding of the project?)
      - technicalDepth (does it demonstrate technical expertise?)
      - communication (is it clearly articulated?)
      - suggestions for improvement
      
      Format the response as JSON:
      {
        "understanding": "string",
        "technicalDepth": "string",
        "communication": "string",
        "suggestions": "string"
      }
      
      Question:
      ${JSON.stringify(question)}
      
      Answer:
      ${answer}
    `;

    const result = await getGeminiCompletion(prompt);
    const jsonStart = result.indexOf('{');  
    const jsonEnd = result.lastIndexOf('}') + 1;
    const jsonString = result.slice(jsonStart, jsonEnd);
    res.json(JSON.parse(jsonString));
  } catch (error) {
    console.error('Error evaluating project answer:', error);
    res.status(500).json({ error: 'Failed to evaluate project answer' });
  }
}
