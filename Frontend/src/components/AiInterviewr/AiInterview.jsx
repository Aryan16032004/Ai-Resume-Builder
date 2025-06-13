import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Slider } from '../../components/ui/slider';
import axios from 'axios';
import {DSARound} from './DSARound';
import {TechnicalRound} from './TechnicalRound';
import{ ProjectRound} from './ProjectRound';

function InterviewStepper({ profileData }) {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { label: "DSA Round" },
    { label: "Technical Round" },
    { label: "Project Round" },
  ];

  return (
    <div>
      {/* Stepper UI */}
      <div className="flex items-center justify-between mb-6">
        {steps.map((step, idx) => (
          <div key={step.label} className="flex items-center">
            <button
              className={`rounded-full w-8 h-8 flex items-center justify-center border-2 ${
                activeStep === idx
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-300"
              }`}
              onClick={() => setActiveStep(idx)}
              aria-label={step.label}
            >
              {idx + 1}
            </button>
            {idx < steps.length - 1 && (
              <div className="w-8 h-1 bg-gray-300 mx-2" />
            )}
          </div>
        ))}
      </div>
      <InterviewContainer profileData={profileData} activeStep={activeStep} />
    </div>
  );
}

function InterviewContainer({ profileData, activeStep }) {
  return (
    <Card className="p-6 mt-4">
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

function AiInterview() {
  const [step, setStep] = useState('start');
  const [resume, setResume] = useState(null);
  const [salaryRange, setSalaryRange] = useState(5); // Default 5L
  const [jobProfile, setJobProfile] = useState('');
  const [profileData, setProfileData] = useState(null);

  const handleStart = () => setStep('form');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStep('processing');
    
    // Process resume
    const formData = new FormData();
    if (resume) {
      formData.append('resume', resume);
    }
    formData.append('salary', salaryRange.toString());
    formData.append('jobProfile', jobProfile);

    const response = await axios.post('http://localhost:8000/api/resume/parse-resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    setProfileData(response.data);
    setStep('profile');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      {step === 'start' && (
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <h1 className="text-4xl font-bold mb-8 text-center">
            Ace Your Next Interview
          </h1>
          <Button 
            onClick={handleStart}
            className="px-8 py-6 text-lg"
          >
            Get Ready for Interviews
          </Button>
        </div>
      )}

      {step === 'form' && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Tell Us About Yourself</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="resume">Upload Your Resume</Label>
                <Input 
                  id="resume" 
                  type="file" 
                  accept=".pdf,.docx"
                  onChange={(e) => setResume(e.target.files?.[0] || null)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Salary Expectations (LPA)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    defaultValue={[5]}
                    min={1}
                    max={30}
                    step={1}
                    onValueChange={(value) => setSalaryRange(value[0])}
                    className="w-full"
                  />
                  <span className="w-16 text-center font-medium">
                    {salaryRange}L
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{'<8L: Beginner'}</span>
                  <span>8-16L: Mid-level</span>
                  <span>{'>16L: Senior'}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobProfile">Job Profile</Label>
                <select
                  id="jobProfile"
                  value={jobProfile}
                  onChange={(e) => setJobProfile(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">Select your job profile</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Fullstack Developer">Fullstack Developer</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                </select>
              </div>

              <Button type="submit" className="w-full">
                Analyze My Profile
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {step === 'processing' && (
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mb-4"></div>
          <h2 className="text-xl font-semibold">Processing your resume...</h2>
          <p className="text-gray-500">Extracting skills and projects</p>
        </div>
      )}

      {step === 'profile' && (
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Your Interview Profile</CardTitle>
              <p className="text-gray-500">Based on your resume and preferences</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">Job Profile</h3>
                <p>{profileData.jobProfile || jobProfile}</p>
              </div>

              <div>
                <h3 className="font-medium">Salary Expectation</h3>
                <p>{salaryRange} LPA ({getDifficultyLevel(salaryRange)})</p>
              </div>

              <div>
                <h3 className="font-medium">Skills</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profileData.skills.map((skill, i) => (
                    <span key={i} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium">Projects</h3>
                <div className="space-y-3 mt-2">
                  {profileData.projects.map((project, i) => (
                    <div key={i} className="border rounded-lg p-3">
                      <h4 className="font-medium">{project.name}</h4>
                      <p className="text-sm text-gray-600">{project.description}</p>
                      <div className="mt-2">
                        <span className="text-xs text-gray-500">Technologies:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {project.technologies.map((tech, j) => (
                            <span key={j} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                onClick={() => setStep('interview')}
                className="w-full mt-6"
              >
                Start Interview Preparation
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {step === 'interview' && (
        <div className="max-w-4xl mx-auto">
          <InterviewStepper profileData={profileData} />
        </div>
      )}
    </div>  
  );
}

export default AiInterview;