import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

function SortableItem({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    background: isDragging ? '#f3f4f6' : undefined,
    cursor: 'grab',
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

function EducationForm({ data, updateData }) {
  const [education, setEducation] = useState({
    institution: '',
    degree: '',
    fieldOfStudy: '',
    startYear: '',
    endYear: '',
    marks: '',
    state: '',
    country: '',
  });

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEducation((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddEducation = () => {
    if (education.institution) {
      updateData([...data, education]);
      setEducation({
        institution: '',
        degree: '',
        fieldOfStudy: '',
        startYear: '',
        endYear: '',
        marks: '',
        state: '',
        country: '',
      });
    }
  };

  const handleRemoveEducation = (index) => {
    updateData(data.filter((_, i) => i !== index));
  };

  // Drag and drop event handler
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = data.findIndex((_, idx) => idx.toString() === active.id);
      const newIndex = data.findIndex((_, idx) => idx.toString() === over.id);
      updateData(arrayMove(data, oldIndex, newIndex));
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Education</h2>

      {/* Existing education entries with drag and drop */}
      {data.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext
            items={data.map((_, i) => i.toString())}
            strategy={verticalListSortingStrategy}
          >
            <div className="mb-6 space-y-4">
              {data.map((edu, index) => (
                <SortableItem key={index} id={index.toString()}>
                  <div className="border border-gray-200 rounded p-4 flex justify-between items-center bg-white shadow-sm">
                    <div className='flex items-center gap-2'>
                      <button className='text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing'><GripVertical size={16} /></button>
                      <div>
                        <h3 className="font-medium">{edu.institution}</h3>
                        <p className="text-sm text-gray-600">
                          {edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRemoveEducation(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add new education form */}
      <div className="space-y-4 border border-gray-200 rounded p-4">
        <h3 className="font-medium">{data.length > 0 ? 'Add Another Education' : 'Add Your Education'}</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700">Institution*</label>
          <input
            type="text"
            name="institution"
            value={education.institution}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Degree</label>
            <input
              type="text"
              name="degree"
              value={education.degree}
              onChange={handleChange}
              placeholder="e.g., Bachelor's"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Field of Study</label>
            <input
              type="text"
              name="fieldOfStudy"
              value={education.fieldOfStudy}
              onChange={handleChange}
              placeholder="e.g., Computer Science"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Year</label>
            <input
              type="number"
              name="startYear"
              value={education.startYear}
              onChange={handleChange}
              min="1900"
              max="2099"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Year</label>
            <input
              type="number"
              name="endYear"
              value={education.endYear}
              onChange={handleChange}
              min="1900"
              max="2099"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Marks/GPA</label>
          <input
            type="text"
            name="marks"
            value={education.marks}
            onChange={handleChange}
            placeholder="e.g., 3.8 GPA or 85%"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">State</label>
            <input
              type="text"
              name="state"
              value={education.state}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Country</label>
            <input
              type="text"
              name="country"
              value={education.country}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <button
          onClick={handleAddEducation}
          disabled={!education.institution}
          className={`px-4 py-2 rounded ${!education.institution ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'}`}
        >
          Add Education
        </button>
      </div>
    </div>
  );
}

export default EducationForm;