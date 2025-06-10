import { Resume } from "../Models/ResumeModels.js";
import { User } from "../Models/UserModel.js";
import generatePdf from "../pdfgenerator.js";
import { uploadOnCloudinary } from "../Cloudinary.js";
import { extractTextFromDocx, extractTextFromPDF } from "../extractResumeText.js";
import { getGeminiCompletion } from "../geminiApi.js";
import fs from 'fs/promises';

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
    // console.log("Generating PDF with HTML content:", html);
    
    
    if (!html) {
      return res.status(400).json({ error: 'HTML content is required' });
    }
    
    const pdf = await generatePdf(html, null); // Pass null to get buffer instead of file
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=resume.pdf'
    });
    
    res.send(pdf);
  } catch (error) {
    console.error('PDF generation error:', error);
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