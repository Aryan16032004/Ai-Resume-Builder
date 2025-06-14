import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Slider } from '../ui/slider';
import axios from 'axios';
import { DSARound } from './DSARound';
import { TechnicalRound } from './TechnicalRound';
import { ProjectRound } from './ProjectRound';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Plus, X, FileText, Briefcase, DollarSign } from 'lucide-react';

function InterviewStepper({ profileData, onClose }) {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { label: "DSA Round", icon: <FileText className="w-4 h-4" /> },
    { label: "Technical Round", icon: <Briefcase className="w-4 h-4" /> },
    { label: "Project Round", icon: <Briefcase className="w-4 h-4" /> },
  ];

  const nextStep = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const prevStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  return (
    <div className="relative">
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <button
                onClick={() => setActiveStep(index)}
                className={`flex items-center justify-center w-10 h-10 rounded-full ${activeStep === index ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}
              >
                {step.icon}
              </button>
              <span className={`mt-2 text-sm font-medium ${activeStep === index ? 'text-blue-600' : 'text-gray-500'}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onClose}
        className="absolute top-0 right-0 p-2 text-gray-400 hover:text-gray-900 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, x: activeStep > 0 ? 50 : -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: activeStep > 0 ? -50 : 50 }}
          transition={{ duration: 0.3 }}
          className="mt-6"
        >
          <InterviewContainer profileData={profileData} activeStep={activeStep} />
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between mt-8">
        <Button
          onClick={prevStep}
          disabled={activeStep === 0}
          variant="outline"
          className="px-6"
        >
          Previous
        </Button>
        <Button
          onClick={nextStep}
          disabled={activeStep === steps.length - 1}
          className="px-6"
        >
          Next
        </Button>
      </div>
    </div>
  );
}

function InterviewContainer({ profileData, activeStep }) {
  return (
    <Card className="p-6 shadow-lg border-0">
      {activeStep === 0 && <DSARound profileData={profileData} />}
      {activeStep === 1 && <TechnicalRound profileData={profileData} />}
      {activeStep === 2 && <ProjectRound profileData={profileData} />}
    </Card>
  );
}

function getDifficultyLevel(salary) {
  if (salary < 8) return 'Beginner';
  if (salary <= 16) return 'Intermediate';
  return 'Advanced';
}

function getDifficultyColor(level) {
  switch (level) {
    case 'Beginner': return 'bg-green-100 text-green-800';
    case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
    case 'Advanced': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function AiInterview() {
  const [showDialog, setShowDialog] = useState(false);
  const [formStep, setFormStep] = useState('form');
  const [resume, setResume] = useState(null);
  const [salaryRange, setSalaryRange] = useState(5);
  const [jobProfile, setJobProfile] = useState('');
  const [profileData, setProfileData] = useState(null);
  const [userProfiles, setUserProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [resumePreview, setResumePreview] = useState(null);

  // Fetch user profiles from MongoDB on mount
  useEffect(() => {
    const fetchProfiles = async () => {
      setLoadingProfiles(true);
      try {
        const res = await axios.get('http://localhost:8000/api/resume/userProfiles');
        setUserProfiles(res.data);
      } catch (e) {
        console.error("Error fetching profiles:", e);
        setUserProfiles([]);
      }
      setLoadingProfiles(false);
    };
    fetchProfiles();
  }, []);

  const handleAddProfile = () => {
    setShowDialog(true);
    setFormStep('form');
    setResume(null);
    setSalaryRange(5);
    setJobProfile('');
    setProfileData(null);
    setResumePreview(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setResume(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setResumePreview({
          name: file.name,
          size: (file.size / 1024).toFixed(2) + ' KB',
          type: file.type
        });
      };
      reader.readAsDataURL(file);
    } else {
      setResumePreview(null);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const formData = new FormData();
      if (resume) formData.append('resume', resume);
      formData.append('salary', salaryRange.toString());
      formData.append('jobProfile', jobProfile);

      const response = await axios.post('http://localhost:8000/api/resume/userProfiles', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setProfileData(response.data);
      setUserProfiles((prev) => [response.data, ...prev]);
      setFormStep('profile');
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to process your resume. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleCardClick = (profile) => {
    setSelectedProfile(profile);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Interview Prep</h1>
            <p className="text-gray-600 mt-2">
              Practice for your next technical interview based on your resume and experience level
            </p>
          </div>
          <Button onClick={handleAddProfile} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Profile
          </Button>
        </div>

        {/* User Profiles List */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Interview Profiles</h2>
          
          {loadingProfiles ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : userProfiles.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-8 text-center shadow-sm border border-dashed border-gray-300"
            >
              <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <Briefcase className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No profiles found</h3>
              <p className="text-gray-500 mb-4">Create your first interview profile to get started</p>
              <Button onClick={handleAddProfile}>
                Create Profile
              </Button>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {userProfiles.map((profile, idx) => (
                <motion.div
                  key={profile._id || idx}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card 
                    className="h-full cursor-pointer transition-all hover:shadow-md hover:border-blue-200"
                    onClick={() => handleCardClick(profile)}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{profile.jobProfile}</CardTitle>
                        <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(profile.difficulty)}`}>
                          {profile.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <DollarSign className="w-4 h-4 mr-1" />
                        <span>{profile.salary} LPA</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills?.slice(0, 5).map((skill, i) => (
                          <span key={i} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                            {skill}
                          </span>
                        ))}
                        {profile.skills?.length > 5 && (
                          <span className="bg-gray-50 text-gray-500 text-xs px-2 py-1 rounded-full">
                            +{profile.skills.length - 5} more
                          </span>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="text-xs text-gray-500">
                      Created {new Date(profile.createdAt).toLocaleDateString()}
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Add Profile Dialog */}
      <AnimatePresence>
        {showDialog && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="relative p-6">
                <button
                  className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  onClick={() => setShowDialog(false)}
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>

                {formStep === 'form' && (
                  <>
                    <div className="text-center mb-6">
                      <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Create Interview Profile</h2>
                      <p className="text-gray-500 mt-2">
                        Upload your resume and set your preferences to generate personalized interview questions
                      </p>
                    </div>
                    
                    <form onSubmit={handleFormSubmit} className="space-y-6">
                      <div className="space-y-3">
                        <Label htmlFor="resume" className="block text-sm font-medium text-gray-700">
                          Upload Resume (PDF/DOCX)
                        </Label>
                        <div className="mt-1">
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
                              {resumePreview ? (
                                <>
                                  <FileText className="w-8 h-8 text-blue-500 mb-2" />
                                  <p className="text-sm font-medium text-gray-700 truncate max-w-xs">{resumePreview.name}</p>
                                  <p className="text-xs text-gray-500">{resumePreview.size}</p>
                                </>
                              ) : (
                                <>
                                  <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                                  </svg>
                                  <p className="text-sm text-gray-500">
                                    <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                                  </p>
                                  <p className="text-xs text-gray-400">PDF or DOCX (MAX. 5MB)</p>
                                </>
                              )}
                            </div>
                            <Input 
                              id="resume" 
                              type="file" 
                              accept=".pdf,.docx"
                              onChange={handleFileChange}
                              className="hidden"
                              required
                            />
                          </label>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="salary" className="block text-sm font-medium text-gray-700">
                          Salary Expectations: <span className="font-semibold text-blue-600">{salaryRange} LPA</span>
                        </Label>
                        <div className="flex items-center gap-4">
                          <Slider
                            defaultValue={[5]}
                            min={1}
                            max={30}
                            step={1}
                            onValueChange={(value) => setSalaryRange(value[0])}
                            className="w-full"
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span className={`${salaryRange < 8 ? 'font-bold text-blue-600' : ''}`}>Beginner</span>
                          <span className={`${salaryRange >= 8 && salaryRange <= 16 ? 'font-bold text-blue-600' : ''}`}>Mid-level</span>
                          <span className={`${salaryRange > 16 ? 'font-bold text-blue-600' : ''}`}>Senior</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="jobProfile" className="block text-sm font-medium text-gray-700">
                          Target Job Profile
                        </Label>
                        <select
                          id="jobProfile"
                          value={jobProfile}
                          onChange={(e) => setJobProfile(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          required
                        >
                          <option value="">Select your job profile</option>
                          <option value="Frontend Developer">Frontend Developer</option>
                          <option value="Backend Developer">Backend Developer</option>
                          <option value="Fullstack Developer">Fullstack Developer</option>
                          <option value="Data Scientist">Data Scientist</option>
                          <option value="DevOps Engineer">DevOps Engineer</option>
                          <option value="Mobile Developer">Mobile Developer</option>
                          <option value="ML Engineer">ML Engineer</option>
                        </select>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={processing}
                      >
                        {processing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : 'Create Profile'}
                      </Button>
                    </form>
                  </>
                )}

                {formStep === 'profile' && profileData && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Profile Created!</h2>
                      <p className="text-gray-500 mt-2">
                        We've analyzed your resume and created a personalized interview profile
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-900 mb-2">Job Profile</h3>
                        <p className="text-gray-700">{profileData.jobProfile || jobProfile}</p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-900 mb-2">Salary & Difficulty</h3>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1 text-gray-600" />
                            <span className="text-gray-700">{salaryRange} LPA</span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(profileData.difficulty)}`}>
                            {profileData.difficulty} Level
                          </span>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-900 mb-2">Key Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {profileData.skills.map((skill, i) => (
                            <span key={i} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {profileData.projects?.length > 0 && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="font-medium text-gray-900 mb-2">Projects</h3>
                          <div className="space-y-3">
                            {profileData.projects.slice(0, 2).map((project, i) => (
                              <div key={i} className="border border-gray-200 rounded-lg p-3 bg-white">
                                <h4 className="font-medium text-gray-900">{project.name}</h4>
                                <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                                <div className="mt-2">
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {project.technologies.map((tech, j) => (
                                      <span key={j} className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full">
                                        {tech}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))}
                            {profileData.projects.length > 2 && (
                              <p className="text-xs text-gray-500 text-center">
                                + {profileData.projects.length - 2} more projects
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowDialog(false)}
                        className="flex-1"
                      >
                        Close
                      </Button>
                      <Button 
                        onClick={() => {
                          setSelectedProfile(profileData);
                          setShowDialog(false);
                        }}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        Start Practice
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interview Modal */}
      <AnimatePresence>
        {selectedProfile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm  flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="overflow-y-auto p-6">
                <InterviewStepper 
                  profileData={selectedProfile} 
                  onClose={() => setSelectedProfile(null)} 
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AiInterview;