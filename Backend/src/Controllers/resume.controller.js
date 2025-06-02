import { Resume } from "../Models/ResumeModels.js";
import { User } from "../Models/UserModel.js";
import generatePdf from "../pdfgenerator.js";
import { uploadOnCloudinary } from "../Cloudinary.js";

export const saveResumeData = async (req, res) => {
  try {
    const userId = req.user._id;
    const { resumeData, resumeId } = req.body;
    console.log("Received resume data:", resumeData, "for user:", userId);

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

     if (req.file?.path) {
      const profileImage = await uploadOnCloudinary(req.file.path);
      if (profileImage?.url) {
        update.profileImage = profileImage.url;
      }
    }

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