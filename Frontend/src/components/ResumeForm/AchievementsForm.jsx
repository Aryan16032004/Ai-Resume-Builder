// components/Resume/AchievementsForm.jsx
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

function AchievementsForm({ data, updateData }) {
  const [achievement, setAchievement] = useState({
    title: '',
    date: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAchievement(prev => ({ ...prev, [name]: value }));
  };

  const handleAddAchievement = () => {
    if (achievement.title) {
      updateData([...data, achievement]);
      setAchievement({
        title: '',
        date: '',
      });
    }
  };

  const handleRemoveAchievement = (index) => {
    updateData(data.filter((_, i) => i !== index));
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  
    const handleDragEnd = (event) => {
      const { active, over } = event;
      
      if (active.id !== over.id) {
        const oldIndex = data.findIndex(ach => ach.title === active.id);
        const newIndex = data.findIndex(ach => ach.title === over.id);
        updateData(arrayMove(data, oldIndex, newIndex));
      }
    };


  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Achievements</h2>
      
      {/* Existing achievements */}
      {data.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
        <SortableContext 
        items={data.map(ach => ach.title)} 
        strategy={verticalListSortingStrategy}
        >
        <div className="mb-6 space-y-4">
          {data.map((ach, index) => (
            <SortableItem key={ach.title} id={ach.title}>
             <div className='flex items-center gap-2 bg-white shadow-sm border border-gray-200 rounded p-4'>
              <button className='text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing'><GripVertical size={16} /></button>
              <div className="flex justify-between items-center w-full">
              <div className="flex flex-col">
                <h3 className="font-medium">{ach.title}</h3>
              </div>
              <button
                onClick={() => handleRemoveAchievement(index)}
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
      
      {/* Add new achievement form */}
      <div className="space-y-4 border border-gray-200 rounded p-4">
        <h3 className="font-medium">{data.length > 0 ? 'Add Another Achievement' : 'Add Your Achievement'}</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Title*</label>
          <input
            type="text"
            name="title"
            value={achievement.title}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            name="date"
            value={achievement.date}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <button
          onClick={handleAddAchievement}
          disabled={!achievement.title}
          className={`px-4 py-2 rounded ${!achievement.title ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'}`}
        >
          Add Achievement
        </button>
      </div>
    </div>
  );
}

export default AchievementsForm;