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

// SortableItem component (reusable)
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

function TrainingForm({ data, updateData }) {
  const [training, setTraining] = useState({
    name: '',
    organization: '',
    description: '',
    points: [''],
    startDate: '',
    endDate: '',
    currentlyOngoing: false,
  });
  const [newTech, setNewTech] = useState('');
  const [isGeneratingPoints, setIsGeneratingPoints] = useState(false);

  // DnD setup
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
      const oldIndex = data.findIndex(item => item.name === active.id);
      const newIndex = data.findIndex(item => item.name === over.id);
      updateData(arrayMove(data, oldIndex, newIndex));
    }
    
    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  // Rest of your existing handlers...
  const handleTrainingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTraining(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePointChange = (index, value) => {
    const newPoints = [...training.points];
    newPoints[index] = value;
    setTraining(prev => ({ ...prev, points: newPoints }));
  };

  const addPoint = () => {
    setTraining(prev => ({ ...prev, points: [...prev.points, ''] }));
  };

  const removePoint = (index) => {
    const newPoints = training.points.filter((_, i) => i !== index);
    setTraining(prev => ({ ...prev, points: newPoints }));
  };

  const generateKeyPoints = async () => {
    if (!training.description.trim()) return;
    
    setIsGeneratingPoints(true);
    try {
      const prompt = `Based on this training description: "${training.description}", generate 3-5 bullet points for a resume. 
      The last point should list technologies/skills learned (format: "Technologies: Java, SQL, etc."). 
      Make it ATS-friendly, quantified, and impactful. Separate points with ;`;
      
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
      
      setTraining(prev => ({
        ...prev,
        points: points.length > 0 ? points : prev.points,
      }));
    } catch (error) {
      console.error('Error generating points:', error);
      alert('Failed to generate points. Please try again.');
    } finally {
      setIsGeneratingPoints(false);
    }
  };

  const handleAddTraining = () => {
    if (training.name && training.organization) {
      updateData([...data, training]);
      setTraining({
        name: '',
        organization: '',
        description: '',
        points: [''],
        startDate: '',
        endDate: '',
        currentlyOngoing: false,
      });
    }
  };

  const handleRemoveTraining = (index) => {
    updateData(data.filter((_, i) => i !== index));
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Training & Certifications</h2>
      
      {/* Existing trainings with DnD */}
      {data.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext 
            items={data.map(item => item.name)} 
            strategy={verticalListSortingStrategy}
          >
            <div className="mb-6 space-y-4">
              {data.map((train, index) => (
                <SortableItem key={train.name} id={train.name} className="border border-gray-200 rounded p-4">
                  <div className="flex justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{train.name} - {train.organization}</h3>
                      <ul className="mt-2 list-disc list-inside text-sm">
                        {train.points.map((point, i) => (
                          <li key={i}>{point}</li>
                        ))}
                      </ul>
                      <div className="mt-2 text-xs text-gray-500">
                        {train.startDate} to {train.currentlyOngoing ? 'Present' : train.endDate}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveTraining(index)}
                      className="text-red-500 hover:text-red-700 ml-4"
                    >
                      Remove
                    </button>
                  </div>
                </SortableItem>
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeId ? (
              <div className="border border-blue-200 bg-blue-50 rounded p-4 shadow-lg">
                <h3 className="font-medium">
                  {data.find(item => item.name === activeId)?.name}
                </h3>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
      
      {/* Add new training form (unchanged) */}
      <div className="space-y-4 border border-gray-200 rounded p-4">
        <h3 className="font-medium">{data.length > 0 ? 'Add Another Training' : 'Add Training'}</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Training Name*</label>
            <input
              type="text"
              name="name"
              value={training.name}
              onChange={handleTrainingChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Organization*</label>
            <input
              type="text"
              name="organization"
              value={training.organization}
              onChange={handleTrainingChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Description (for generating points)</label>
          <textarea
            name="description"
            value={training.description}
            onChange={handleTrainingChange}
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe what you learned and accomplished..."
          />
          <button
            onClick={generateKeyPoints}
            disabled={!training.description.trim() || isGeneratingPoints}
            className={`mt-2 px-4 py-2 rounded ${!training.description.trim() || isGeneratingPoints ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
          >
            {isGeneratingPoints ? 'Generating...' : 'Generate Key Points'}
          </button>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Key Points</label>
          {training.points.map((point, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={point}
                onChange={(e) => handlePointChange(index, e.target.value)}
                className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {training.points.length > 1 && (
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
              value={training.startDate}
              onChange={handleTrainingChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              name="endDate"
              value={training.endDate}
              onChange={handleTrainingChange}
              disabled={training.currentlyOngoing}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            />
            <div className="mt-1 flex items-center">
              <input
                id="currentlyOngoing"
                name="currentlyOngoing"
                type="checkbox"
                checked={training.currentlyOngoing}
                onChange={handleTrainingChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="currentlyOngoing" className="ml-2 block text-sm text-gray-700">
                Currently ongoing
              </label>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleAddTraining}
          disabled={!training.name || !training.organization}
          className={`px-4 py-2 rounded ${!training.name || !training.organization ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'}`}
        >
          Add Training
        </button>
      </div>
    </div>
  );
}

export default TrainingForm;