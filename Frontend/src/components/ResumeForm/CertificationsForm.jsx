// components/Resume/CertificationsForm.jsx
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

function CertificationsForm({ data, updateData }) {
  const [certification, setCertification] = useState({
    name: '',
    issuer: '',
    link:'',
    date: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCertification(prev => ({ ...prev, [name]: value }));
  };

  const handleAddCertification = () => {
    if (certification.name) {
      updateData([...data, certification]);
      setCertification({
        name: '',
        issuer: '',
        link: '',
        date: '',
      });
    }
  };

  const handleRemoveCertification = (index) => {
    updateData(data.filter((_, i) => i !== index));
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  
  const handleDragEnd = (event) => {
      const { active, over } = event;
      
      if (active.id !== over.id) {
        const oldIndex = data.findIndex(cert => cert.name === active.id);
        const newIndex = data.findIndex(cert => cert.name === over.id);
        updateData(arrayMove(data, oldIndex, newIndex));
      }

    };


  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Certifications</h2>
      
      {data.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext 
            items={data.map(cert => cert.name)} 
            strategy={verticalListSortingStrategy}
          >
            <div className="mb-6 space-y-4">
              {data.map((cert, index) => (
                <SortableItem key={cert.name} id={cert.name}>
                  <div className='flex items-center gap-2 bg-white shadow-sm border border-gray-200 rounded p-4'>
                    <button className='text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing'><GripVertical size={16} /></button>
                    <div className="flex justify-between items-center w-full">
                    <div className="flex flex-col">
                      <h3 className="font-medium">{cert.name}</h3>
                      <p className="text-sm text-gray-600">{cert.issuer}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveCertification(index)}
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

      
      {/* Add new certification form */}
      <div className="space-y-4 border border-gray-200 rounded p-4">
        <h3 className="font-medium">{data.length > 0 ? 'Add Another Certification' : 'Add Your Certification'}</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Certification Name*</label>
          <input
            type="text"
            name="name"
            value={certification.name}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Issuing Organization</label>
          <input
            type="text"
            name="issuer"
            value={certification.issuer}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Certificate Link</label>
          <input
            type="url"
            name="link"
            value={certification.link}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Date Earned</label>
          <input
            type="date"
            name="date"
            value={certification.date}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        
        <button
          onClick={handleAddCertification}
          disabled={!certification.name}
          className={`px-4 py-2 rounded ${!certification.name ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'}`}
        >
          Add Certification
        </button>
      </div>
    </div>
  );
}

export default CertificationsForm;