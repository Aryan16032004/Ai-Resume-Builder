import React, { useState, useEffect, useMemo } from 'react';
import { debounce } from 'lodash';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import PersonalInfoForm from './PersonalInfoForm';
import SkillsForm from './SkillsForm';
import ProjectsForm from './ProjectsForm';
import EducationForm from './EducationForm';
import CertificationsForm from './CertificationsForm';
import AchievementsForm from './AchievementsForm';
import DownloadDropdown from '../DownloadDropDown';
import resumeService from '../../backend/resume';
import TemplateLoader from './TemplateLoader';
import TrainingForm from './TrainingForm';
import {toast,Toaster} from "sonner"

function Resume() {
  const { id: resumeId } = useParams();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [resumeData, setResumeData] = useState(null);
  const [error, setError] = useState(null);


  const emptyResume = {
    name: '',
    personalInfo: {
      fullName: '',
      pincode: '',
      state:'',
      city: '',
      email: '',
      phone: '',
      linkedIn: '',
      linkedinLink:'',
      github: '',
      githubLink: '',
      summary: ''
    },
    trainings: [],
    skills: {
      languages: [],
      frameworks: [],
      toolsplatforms: [],
      softSkills: []
    },
    projects: [],
    education: [],
    certifications: [],
    achievements: []
  };

  // Load resume data
  useEffect(() => {
    const fetchResume = async () => {
      try {
        setIsLoading(true);
        const data = resumeId 
          ? await resumeService.getResumeData(resumeId)
          : emptyResume;
        setResumeData(data);
      } catch (err) {
        console.error('Error fetching resume:', err);
        setError('Failed to load resume');
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResume();
  }, [resumeId]);
// console.log("fecthed data",resumeData);

  // Debounced auto-save
  const debouncedSave = useMemo(
    () => debounce(async (data) => {
       try {
      await resumeService.saveResumeData({ resumeId, resumeData: data });
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
    }, 10000),
    [resumeId]
  );

  // Save on changes
  useEffect(() => {
    if (resumeData) {
      debouncedSave(resumeData);
    }
    return () => debouncedSave.cancel();
  }, [resumeData, debouncedSave]);

  const handleSave = async () => {
 try {
  // console.log("data sending to resume.js",resumeData);
  
    await resumeService.saveResumeData({ resumeId, resumeData });
    toast.success('Resume saved successfully!');
  } catch (error) {
    console.error('Error saving resume:', error);
    toast.error('Failed to save resume. Please check your authentication.');
  }
  };

const handleDownload = async (type) => {
  if (type === 'print') {
    const element = document.getElementById('resume-preview');
    element.classList.add('print-mode');
    window.print();
    setTimeout(() => element.classList.remove('print-mode'), 1000);
    return;
  }

  try {
    if (type === 'pdf') {
      const element = document.getElementById('resume-preview');
    
      const clone = element.cloneNode(true);
      
      const styles = Array.from(document.styleSheets)
        .map(sheet => {
          try {
            return Array.from(sheet.cssRules)
              .map(rule => rule.cssText)
              .join('\n');
          } catch (e) {
            return ''; 
          }
        })
        .join('\n');
      
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              /* Base print styles */
              body { 
                font-family: 'Times New Roman', Times, serif;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              a { 
                text-decoration: underline !important; 
                color: #2563eb !important;
              }
              
              /* Include all detected styles */
              ${styles}
              
              /* Force Tailwind classes to be applied */
              /* Layout */
              .flex { display: flex !important; }
              .flex-col { flex-direction: column !important; }
              .justify-between { justify-content: space-between !important; }
              .justify-center { justify-content: center !important; }
              .items-center { align-items: center !important; }
              .space-y-1 > * + * { margin-top: 0.25rem !important; }
              .space-y-2 > * + * { margin-top: 0.5rem !important; }

              /* Spacing */
              .gap-2 { gap: 0.5rem !important; }
              .gap-4 { gap: 1rem !important; }
              .gap-8 { gap: 2rem !important; }
              .gap-\\[15px\\] { gap: 15px !important; }
              .gap-\\[25px\\] { gap: 25px !important; }
              .gap-\\[40px\\] { gap: 40px !important; }
              .gap-\\[50px\\] { gap: 50px !important; }
              .p-6 { padding: 2.5rem !important; }
              .mb-1 { margin-bottom: 0.25rem !important; }
              .mb-2 { margin-bottom: 0.5rem !important; }
              .ml-2 { margin-left: 0.5rem !important; }
              .ml-\\[13px\\] { margin-left: 13px !important; }
              .ml-\\[15px\\] { margin-left: 15px !important; }

              /* Typography */
              .text-\\[13px\\] { font-size: 13px !important; }
              .text-\\[17px\\] { font-size: 15px !important; }
              .text-\\[19px\\] { font-size: 19px !important; }
              .text-\\[25px\\] { font-size: 25px !important; }
              .font-bold { font-weight: 700 !important; }
              .font-medium { font-weight: 500 !important; }
              .font-semibold { font-weight: 600 !important; }
              .italic { font-style: italic !important; }

              /* Colors */
              .text-blue-500 { color: #3b82f6 !important; }
              .text-blue-600 { color: #2563eb !important; }
              .text-blue-800 { color: #1e40af !important; }
              .text-gray-600 { color: #4b5563 !important; }
              .text-gray-800 { color: #1f2937 !important; }
              .bg-blue-50 { background-color: #eff6ff !important; }
              .bg-white { background-color: #ffffff !important; }

              /* Borders */
              .border { border-width: 1px !important; }
              .border-b { border-bottom-width: 1px !important; }
              .border-gray-200 { border-color: #e5e7eb !important; }
              .border-gray-800 { border-color: #1f2937 !important; }
              .border-blue-200 { border-color: #bfdbfe !important; }

              /* Accessibility */
              .list-none { list-style-type: none !important; }
            </style>
          </head>
          <body>
            ${clone.outerHTML}
          </body>
        </html>
      `;

      const response = await axios.post('http://localhost:8000/api/resume/generate', 
        { html }, 
        {
          responseType: 'blob',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `resume_${new Date().toISOString().slice(0,10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    }
  } catch (err) {
    console.error('Download error:', err);
    toast.error(`PDF generation failed: ${err.message}`);
  }
};

  // Update functions
  const updatePersonalInfo = (data) => setResumeData(prev => ({ ...prev, personalInfo: data }));
  const updateSkills = (data) => setResumeData(prev => ({ ...prev, skills: data }));
  const updateProjects = (data) => setResumeData(prev => ({ ...prev, projects: data }));
  const updateEducation = (data) => setResumeData(prev => ({ ...prev, education: data }));
  const updateCertifications = (data) => setResumeData(prev => ({ ...prev, certifications: data }));
  const updateAchievements = (data) => setResumeData(prev => ({ ...prev, achievements: data }));

  const handleNext = () => activeStep < steps.length - 1 && setActiveStep(activeStep + 1);
  const handleBack = () => activeStep > 0 && setActiveStep(activeStep - 1);
   const handleStepClick = (index) => setActiveStep(index);

  if (isLoading) return <div className="p-8 text-center">Loading resume...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!resumeData) return <div className="p-8 text-center">Resume not found</div>;
// console.log(resumeData?.templateName);

  const steps = [
    { title: 'Personal Info', component: <PersonalInfoForm data={resumeData.personalInfo} updateData={updatePersonalInfo} templateName ={resumeData.templateName} /> },
    { title: 'Skills', component: <SkillsForm data={resumeData.skills} updateData={updateSkills} /> },
    {title: 'Training', component: <TrainingForm data={resumeData.trainings || []} updateData={(trainings) => setResumeData({...resumeData, trainings})}/> },
    { title: 'Projects', component: <ProjectsForm data={resumeData.projects} updateData={updateProjects} /> },
    { title: 'Certifications', component: <CertificationsForm data={resumeData.certifications} updateData={updateCertifications} /> },
    { title: 'Achievements', component: <AchievementsForm data={resumeData.achievements} updateData={updateAchievements} /> },
    { title: 'Education', component: <EducationForm data={resumeData.education} updateData={updateEducation} /> },
    { title: 'Preview',component: (<TemplateLoader templateName={resumeData.templateName} data={resumeData} id="resume-preview"/>)},
  ];

  return (
    <div>
      <Toaster richColors expand={true}/>
      <div className="flex flex-col justify-center items-center p-4 shadow-sm">
        <input
          type="text"
          value={resumeData.name}
          onChange={(e) => setResumeData({...resumeData, name: e.target.value})}
          placeholder="Resume name"
          className="text-center text-lg font-bold mb-2 border-b-2 border-gray-300 focus:border-blue-500 outline-none"
        />
        <h1 className='font-bold text-[24px]'>Design your resume</h1>
        <p className='text-sm text-gray-400'>Follow the steps below to create your resume</p>
      </div>

      <div className="flex justify-center my-4">
        <div className="flex overflow-x-auto py-2 px-4">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center cursor-pointer ">
              <div className={`rounded-full w-8 h-8 flex items-center justify-center  ${
                index === activeStep ? 'bg-blue-500 text-white' : 
                index < activeStep ? 'bg-green-500 text-white' : 'bg-gray-200'
              }`}
               onClick={() => handleStepClick(index)}
               >
                {index + 1}
              </div>
              <div className={`mx-2 ${index === activeStep ? 'font-bold' : ''}`}
               onClick={() => handleStepClick(index)}
               >
                {step.title}
              </div>
              {index < steps.length - 1 && <div className="mx-2">→</div>}
            </div>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/2 bg-white p-6 rounded-lg shadow-md">
            {steps[activeStep].component}
            <div className="flex justify-between mt-8">
              <button
                onClick={handleBack}
                disabled={activeStep === 0}
                className={`px-4 py-2 rounded ${activeStep === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                Back
              </button>
              {activeStep < steps.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Next
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Save
                  </button>
                  <DownloadDropdown onSelect={handleDownload} />
                </div>
              )}
            </div>
          </div>
          <div className="lg:w-1/2 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Resume Preview</h2>
           <div className="border border-gray-200 p-4">
              <TemplateLoader 
                templateName={resumeData.templateName}
                data={resumeData}
                id="resume-preview"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Resume;