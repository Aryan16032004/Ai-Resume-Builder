import { useState, useRef } from 'react';
import axios from 'axios';
import { toast,Toaster } from 'sonner';
import resumeService from '../../backend/resume';

const ATSChecker = () => {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please upload your resume');
      return;
    }

    if (!jobTitle && !jobDescription) {
      toast.error('Please provide either job title or description');
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      const formData = new FormData();
      formData.append('resume', file);
      if (jobTitle) formData.append('jobTitle', jobTitle);
      if (jobDescription) formData.append('jobDescription', jobDescription);

      const response =await resumeService.checkAtsScore(formData);

      
      setResults(response);

    } catch (error) {
      console.error('Error checking resume:', error);
      
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Failed to analyze resume. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <Toaster expand richColors />
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              ATS Resume Checker
            </span>
          </h1>
          <p className="text-lg text-gray-600">
            Optimize your resume for Applicant Tracking Systems and get more interviews
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title (Optional)
                </label>
                <input
                  type="text"
                  id="jobTitle"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="e.g. Software Engineer"
                />
              </div>

              <div>
                <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Job Description (Optional)
                </label>
                <textarea
                  id="jobDescription"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="Paste the job description here..."
                />
                <p className="mt-1 text-sm text-gray-500">
                  Provide either job title or description for better analysis
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Resume (PDF or DOCX)
                </label>
                <div className="mt-1 flex items-center gap-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.docx"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="px-4 py-2.5 bg-white border-2 border-dashed border-indigo-300 rounded-lg text-indigo-600 font-medium hover:bg-indigo-50 transition-colors"
                  >
                    Choose File
                  </button>
                  <span className={`text-sm ${file ? 'text-gray-800' : 'text-gray-500'}`}>
                    {file ? file.name : 'No file selected'}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${isLoading ? 'opacity-80 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing...
                    </>
                  ) : 'Check Resume'}
                </button>
              </div>
            </form>
          </div>

          {results && (
            <div className="border-t border-gray-200 bg-gray-50 p-6 sm:p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  Analysis Results
                </h2>
                
                {/* Score Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">ATS Score</h3>
                  <div className="relative pt-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-indigo-200 text-indigo-800">
                          {results.score >= 70 ? 'Excellent' : results.score >= 40 ? 'Good' : 'Needs Work'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-indigo-600">
                          {results.score}/100
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-gray-200">
                      <div
                        style={{ width: `${results.score}%` }}
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                          results.score >= 70 ? 'bg-green-500' : 
                          results.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Missing Keywords Section */}
                {results.keywords.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Missing Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {results.keywords.map((keyword, index) => (
                        <span 
                          key={index} 
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Improvements Section */}
                {results.improvements.length > 0 && (
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Improvement Suggestions</h3>
                        <div className="space-y-4">
                        {results.improvements.map((improvement, index) => {
                            // Split the improvement at the first colon
                            const parts = improvement.split(':');
                            const boldPart = parts[0];
                            const rest = parts.slice(1).join(':').trim();
                            
                            return (
                            <div key={index} className="flex items-start">
                                <div className="flex-shrink-0 mt-1">
                                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-600">
                                    {index + 1}
                                </div>
                                </div>
                                <div className="ml-3">
                                <p className="text-gray-700">
                                    <span className="font-bold">{boldPart}:</span> {rest}
                                </p>
                                </div>
                            </div>
                            );
                        })}
                        </div>
                    </div>
                    )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Upload your resume and job description to get personalized optimization suggestions</p>
        </div>
      </div>
    </div>
  );
};

export default ATSChecker;