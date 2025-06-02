import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  name:String,
  templateName: {
  type: String,
  required: true,
} ,
   profileImage: {
    type: String,
  },

  personalInfo: {
    fullName: { type: String},
    pincode: String,
    state:String,
    city: String,
    email: { type: String},
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
    points: [String], // AI-generated
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
    country:String,
  }],
  // workExperience: [{
  //   company: { type: String, required: true },
  //   position: { type: String, required: true },
  //   startDate: Date,
  //   endDate: Date,
  //   currentlyWorking: Boolean,
  //   description: [String] // AI-generated points
  // }],
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
  }
}, { timestamps: true });

export const Resume = mongoose.model("Resume", resumeSchema);