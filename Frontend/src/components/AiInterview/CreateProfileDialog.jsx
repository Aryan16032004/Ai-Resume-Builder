import { useState, useRef } from 'react';
import { Upload, FileText, Briefcase, DollarSign, ChevronLeft } from 'lucide-react';
import { toast,Toaster } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '../ui/dialog';
import { Progress } from '../ui/progress';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

export default function CreateProfileDialog({ isOpen, onClose, onProfileCreated }) {
  const [step, setStep] = useState(1);
  const [resumeFile, setResumeFile] = useState(null);
  const [jobProfile, setJobProfile] = useState('');
  const [salary, setSalary] = useState(10);
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResumeFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/pdf' || 
                 file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      setResumeFile(file);
    }
  };

  const getDifficultyLevel = (salary) => {
    if (salary < 8) return 'Beginner';
    if (salary <= 16) return 'Intermediate';
    return 'Advanced';
  };

  const handleSubmit = async () => {
    if (!resumeFile || !jobProfile) return;
    
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('jobProfile', jobProfile);
      formData.append('salary', salary.toString());

      const response = await fetch('http://localhost:8000/api/interview/userProfiles', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create profile');
      }

      const data = await response.json();
      onProfileCreated(data);
      
      toast.success('Your interview profile has been created.');
      
      onClose();
      setStep(1);
      setResumeFile(null);
      setJobProfile('');
      setSalary(10);
    } catch (error) {

      toast.error('Error creating profile');
      console.error('Error creating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? 'Upload Resume' : 'Complete Profile'}
          </DialogTitle>
        </DialogHeader>

        <div className="mb-6">
          <div className="flex mb-2">
            <div className={`flex-1 border-t-2 ${step >= 1 ? 'border-indigo-600' : 'border-gray-300'} pt-1`}>
              <p className={`text-xs font-medium ${step >= 1 ? 'text-indigo-600' : 'text-gray-500'}`}>1. Upload</p>
            </div>
            <div className={`flex-1 border-t-2 ${step >= 2 ? 'border-indigo-600' : 'border-gray-300'} pt-1`}>
              <p className={`text-xs font-medium ${step >= 2 ? 'text-indigo-600' : 'text-gray-500'}`}>2. Details</p>
            </div>
          </div>
        </div>

        {step === 1 ? (
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-500 transition-colors"
            onClick={() => fileInputRef.current.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.docx"
              className="hidden"
            />
            
            {resumeFile ? (
              <div className="flex flex-col items-center">
                <FileText className="h-10 w-10 text-indigo-500 mb-2" />
                <p className="text-sm font-medium text-gray-900">{resumeFile.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {Math.round(resumeFile.size / 1024)} KB
                </p>
                <Button 
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setResumeFile(null);
                  }}
                  className="mt-3 text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Change file
                </Button>
              </div>
            ) : (
              <>
                <Upload className="mx-auto h-10 w-10 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  <span className="font-medium text-indigo-600">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PDF or DOCX files only
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="jobProfile" className="block text-sm font-medium text-gray-700 mb-1">
                Job Profile
              </label>
              <Input
                type="text"
                id="jobProfile"
                value={jobProfile}
                onChange={(e) => setJobProfile(e.target.value)}
                placeholder="e.g. Frontend Developer, Data Scientist"
              />
            </div>

            <div>
              <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-1">
                Expected Salary (LPA)
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  id="salary"
                  min="0"
                  max="30"
                  step="1"
                  value={salary}
                  onChange={(e) => setSalary(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700 w-12">
                  {salary} LPA
                </span>
              </div>
              <div className="mt-2">
                <Progress value={(salary / 30) * 100} className="h-2" />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Difficulty: <span className="font-medium">{getDifficultyLevel(salary)}</span>
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-6">
          {step === 2 ? (
            <Button
              variant="outline"
              onClick={() => setStep(1)}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          ) : (
            <DialogClose asChild>
              <Button variant="outline">
                Cancel
              </Button>
            </DialogClose>
          )}
          
          <Button
            onClick={() => {
              if (step === 1 && resumeFile) {
                setStep(2);
              } else if (step === 2) {
                handleSubmit();
              }
            }}
            disabled={(step === 1 && !resumeFile) || (step === 2 && !jobProfile) || isLoading}
          >
            {isLoading ? (
              'Processing...'
            ) : step === 1 ? (
              'Continue'
            ) : (
              'Create Profile'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}