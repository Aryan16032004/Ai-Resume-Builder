// components/Resume/ProjectsForm.jsx
import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

// Sortable item component
function SortableItem({ id, children, ...props }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div ref={setNodeRef} style={style} {...props}>
      <div className="flex items-center gap-2">
        <button
          {...attributes}
          {...listeners}
          className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
        >
          <GripVertical size={16} />
        </button>
        {children}
      </div>
    </div>
  );
}


function ProjectsForm({ data, updateData }) {
  const [project, setProject] = useState({
    title: '',
    summary: '',
    points: [''],
    startDate: '',
    endDate: '',
    currentlyWorking: false,
    technologies: [],
    githubLink: '',
    liveLink:''
  });
  const [newTech, setNewTech] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [isGeneratingPoints, setIsGeneratingPoints] = useState(false);

  const handleProjectChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProject(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePointChange = (index, value) => {
    const newPoints = [...project.points];
    newPoints[index] = value;
    setProject(prev => ({ ...prev, points: newPoints }));
  };

  const addPoint = () => {
    setProject(prev => ({ ...prev, points: [...prev.points, ''] }));
  };

  const removePoint = (index) => {
    const newPoints = project.points.filter((_, i) => i !== index);
    setProject(prev => ({ ...prev, points: newPoints }));
  };

  const handleAddTech = () => {
    if (newTech.trim()) {
      setProject(prev => ({
        ...prev,
        technologies: [...prev.technologies, newTech.trim()]
      }));
      setNewTech('');
    }
  };

  const handleRemoveTech = (index) => {
    setProject(prev => ({
      ...prev,
      technologies: prev.technologies.filter((_, i) => i !== index)
    }));
  };

  const generateKeyPoints = async () => {
    if (!projectDescription.trim()) return;
    
    setIsGeneratingPoints(true);
    try {
      const prompt = `Based on this project description: "${projectDescription}", generate exactly 4 lines, impactful bullet points that would perform well in ATS (Applicant Tracking Systems). Focus on specific achievements, technologies used, and quantifiable results . Format the response as separated using ; symbol list without numbering . The ponits should be quantified and impactful.`;
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });
      
      const result = await response.json();
      const generatedText = result.candidates[0].content.parts[0].text;
      const points = generatedText.split(';').map(point => point.trim()).filter(point => point);
      
      setProject(prev => ({
        ...prev,
        points: points.length > 0 ? points : prev.points
      }));
    } catch (error) {
      console.error('Error generating points:', error);
      alert('Failed to generate points. Please try again.');
    } finally {
      setIsGeneratingPoints(false);
    }
  };

  const handleAddProject = () => {
    if (project.title) {
      updateData([...data, project]);
      setProject({
        title: '',
        summary: '',
        points: [''],
        startDate: '',
        endDate: '',
        currentlyWorking: false,
        technologies: [],
        githubLink: '',
        liveLink: ''
      });
      setProjectDescription('');
    }
  };

  const handleRemoveProject = (index) => {
    updateData(data.filter((_, i) => i !== index));
  };


   const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const [activeId, setActiveId] = useState(null);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = data.findIndex(proj => proj.title === active.id);
      const newIndex = data.findIndex(proj => proj.title === over.id);
      updateData(arrayMove(data, oldIndex, newIndex));
    }
    
    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Projects</h2>
      
      {/* Existing projects with drag-and-drop */}
      {data.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext 
            items={data.map(proj => proj.title)} 
            strategy={verticalListSortingStrategy}
          >
            <div className="mb-6 space-y-4">
              {data.map((proj, index) => (
                <SortableItem key={proj.title} id={proj.title}>
                  <div className="border border-gray-200 rounded p-4 flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{proj.title}</h3>
                      <button
                        onClick={() => handleRemoveProject(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                    <p className="text-sm text-gray-600">{proj.summary}</p>
                    <ul className="mt-2 list-disc list-inside text-sm">
                      {proj.points.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                    {proj.technologies.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {proj.technologies.map((tech, i) => (
                          <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </SortableItem>
              ))}
            </div>
          </SortableContext>
          
          <DragOverlay>
            {activeId ? (
              <div className="border border-blue-200 bg-blue-50 rounded p-4 shadow-lg">
                <h3 className="font-medium">
                  {data.find(proj => proj.title === activeId)?.title}
                </h3>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
      
      {/* Add new project form */}
      <div className="space-y-4 border border-gray-200 rounded p-4">
        <h3 className="font-medium">{data.length > 0 ? 'Add Another Project' : 'Add Your First Project'}</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Project Title*</label>
          <input
            type="text"
            name="title"
            value={project.title}
            onChange={handleProjectChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Summary</label>
          <textarea
            name="summary"
            value={project.summary}
            onChange={handleProjectChange}
            rows={2}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Project Description (for generating points)</label>
          <textarea
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe your project in detail to generate key points..."
          />
          <button
            onClick={generateKeyPoints}
            disabled={!projectDescription.trim() || isGeneratingPoints}
            className={`mt-2 px-4 py-2 rounded ${!projectDescription.trim() || isGeneratingPoints ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
          >
            {isGeneratingPoints ? 'Generating...' : 'Generate Key Points'}
          </button>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Key Points</label>
          {project.points.map((point, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={point}
                onChange={(e) => handlePointChange(index, e.target.value)}
                className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe what you did/accomplished"
              />
              {project.points.length > 1 && (
                <button
                  onClick={() => removePoint(index)}
                  className="px-2 text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addPoint}
            className="mt-1 text-sm text-blue-500 hover:text-blue-700"
          >
            + Add another point
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={project.startDate}
              onChange={handleProjectChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              name="endDate"
              value={project.endDate}
              onChange={handleProjectChange}
              disabled={project.currentlyWorking}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            />
            <div className="mt-1 flex items-center">
              <input
                id="currentlyWorking"
                name="currentlyWorking"
                type="checkbox"
                checked={project.currentlyWorking}
                onChange={handleProjectChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="currentlyWorking" className="ml-2 block text-sm text-gray-700">
                Currently working on this
              </label>
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Technologies Used</label>
          <div className="flex gap-2 mt-1">
            <input
              type="text"
              value={newTech}
              onChange={(e) => setNewTech(e.target.value)}
              placeholder="Add technology"
              className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleAddTech}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add
            </button>
          </div>
          {project.technologies.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {project.technologies.map((tech, index) => (
                <span key={index} className="inline-flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
                  {tech}
                  <button
                    onClick={() => handleRemoveTech(index)}
                    className="ml-2 text-gray-500 hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Project Github Link</label>
          <input
            type="url"
            name="githubLink"
            value={project.githubLink}
            onChange={handleProjectChange}
            placeholder="https://example.com"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Project Live Link</label>
          <input
            type="url"
            name="liveLink"
            value={project.liveLink}
            onChange={handleProjectChange}
            placeholder="https://example.com"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <button
          onClick={handleAddProject}
          disabled={!project.title}
          className={`px-4 py-2 rounded ${!project.title ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'}`}
        >
          Add Project
        </button>
      </div>
    </div>
  );
}

export default ProjectsForm;