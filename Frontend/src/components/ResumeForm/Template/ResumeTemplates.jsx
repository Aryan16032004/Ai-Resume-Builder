import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import GeneralPreview from './GeneralPreview.jsx';
import SpecializedPreview from './SpecializedPreview';
import resumeService from '../../../backend/resume.js';
import { Button } from "../../ui/button.jsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";

function ResumeTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [resumeName, setResumeName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const templates = [
    {
      name: 'General Resume',
      description: 'Professional format suitable for most industries',
  thumbnail: '/general-template.jpg',
  previewComponent: GeneralPreview,
  previewImage: '/general-template.jpg'
    },
    {
      name: 'Specialized Resume',
      description: 'Tailored for specific roles with a modern design',
  thumbnail: '/specialized-template.jpg',
  previewComponent: SpecializedPreview,
  previewImage: '/specialized-template.jpg'
    }
  ];

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
  };

  const handleContinueClick = () => {
    setIsDialogOpen(true);
  };

  const handleCreateResume = async () => {
    if (!resumeName.trim()) {
      alert('Please enter a resume name');
      return;
    }

    try {
      const response = await resumeService.createResume(
        resumeName,
        selectedTemplate.previewComponent.name // Using the component name as template identifier
      );
      navigate(`/resume/${response._id}`);
    } catch (error) {
      console.error('Error creating resume:', error);
    } finally {
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 font-serif">Select Your Resume Style</h1>
          <p className="text-xl text-gray-600">Choose a template that reflects your professional identity</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {templates.map((template, index) => (
            <div 
              key={index}
              className={`relative group cursor-pointer transition-all duration-300 ${
                selectedTemplate?.name === template.name ? 'ring-4 ring-blue-500' : 'hover:ring-2 hover:ring-blue-300'
              }`}
              onClick={() => handleTemplateSelect(template)}
            >
              <div className="aspect-w-3 aspect-h-4 overflow-hidden rounded-lg shadow-lg">
                <img
                  src={template.thumbnail}
                  alt={template.name}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-2xl font-semibold text-gray-900">{template.name}</h3>
                <p className="mt-2 text-gray-600">{template.description}</p>
                {selectedTemplate?.name === template.name && (
                  <div className="mt-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      Selected
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {selectedTemplate && (
          <div className="mt-16">
            <div className="bg-white rounded-xl shadow-xl overflow-hidden">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedTemplate.name} Preview</h2>
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                  <img 
                    src={selectedTemplate.previewImage} 
                    alt={`${selectedTemplate.name} Preview`}
                    className="w-full h-auto"
                  />
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 text-center">
                <Button
                  onClick={handleContinueClick}
                  className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  Use {selectedTemplate.name}
                  <svg className="ml-3 -mr-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Name Your Resume</DialogTitle>
              <DialogDescription>
                Give your resume a name to easily identify it later.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={resumeName}
                  onChange={(e) => setResumeName(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., Software Engineer Resume"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleCreateResume}>
                Create Resume
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default ResumeTemplates;