import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
  name: String,
  description: String,
  technologies: [String],
});

const UserProfileSchema = new mongoose.Schema({
  name: String,
  email: String,
  skills: [String],
  projects: [ProjectSchema],
  jobProfile: String,
  salary: Number,
  difficulty: String,
  resumeText: String, // Optional: store raw text if needed
  createdAt: { type: Date, default: Date.now }
});

export const UserProfile = mongoose.model('UserProfile', UserProfileSchema);