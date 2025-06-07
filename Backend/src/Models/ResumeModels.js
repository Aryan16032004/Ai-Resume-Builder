import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  name: {
    type: String,
    index: true
  },
  templateName: {
    type: String,
    required: true,
    index: true
  },
  profileImage: {
    type: String,
  },
  personalInfo: {
    fullName: { 
      type: String,
      index: true
    },
    pincode: String,
    state: String,
    city: String,
    email: { 
      type: String,
      index: true
    },
    phone: String,
    linkedIn: String,
    linkedInLink: String,
    github: String,
    githubLink: String,
    portfolio: String,
    summary: String
  },
  skills: {
    languages: [String],
    frameworks: [String],
    toolsplatforms: [String],
    softSkills: [String]
  },
  projects: [{
    title: { type: String, required: true },
    summary: { type: String},
    points: [String],
    startDate: Date,
    endDate: Date,
    currentlyWorking: { type: Boolean, default: false },
    technologies: [String],
    link: String
  }],
  education: [{
    institution: { type: String, required: true },
    degree: String,
    fieldOfStudy: String,
    startYear: Number,
    endYear: Number,
    marks: String,
    state: String,
    country: String,
  }],
  trainings: [{
    name: { type: String, required: true },         
    organization: { type: String, required: true },                              
    points: [String],                             
    startDate: Date,                                
    endDate: Date,                                  
    currentlyOngoing: Boolean,                                           
  }],
  certifications: [{
    name: { type: String, required: true },
    issuer: String,
    link: String,
    date: Date,
  }],
  achievements: [{
    title: { type: String, required: true },
    date: Date,
  }],
  settings: {
    template: { type: String, default: "general" },
    lastUpdated: { type: Date, default: Date.now }
  },
  isPublic: {
    type: Boolean,
    default: false,
    index: true
  },
  viewCount: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for common queries
resumeSchema.index({ user: 1, templateName: 1 });
resumeSchema.index({ 'personalInfo.email': 1, isPublic: 1 });

// Static method for finding public resumes
resumeSchema.statics.findPublicResumes = function() {
  return this.find({ isPublic: true })
    .select('name templateName personalInfo settings')
    .lean();
};

// Static method for finding user's resumes
resumeSchema.statics.findUserResumes = function(userId) {
  return this.find({ user: userId })
    .select('name templateName settings lastUpdated')
    .lean();
};

// Method to increment view count
resumeSchema.methods.incrementViewCount = async function() {
  this.viewCount += 1;
  return this.save();
};

// Virtual for full name
resumeSchema.virtual('fullName').get(function() {
  return this.personalInfo?.fullName || '';
});

export const Resume = mongoose.model("Resume", resumeSchema);