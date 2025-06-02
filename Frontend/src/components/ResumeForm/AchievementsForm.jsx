// components/Resume/AchievementsForm.jsx
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
        const oldIndex = data.findIndex(ach => ach.title === active.id);
        const newIndex = data.findIndex(ach => ach.title === over.id);
        updateData(arrayMove(data, oldIndex, newIndex));
      }
      
      setActiveId(null);
    };
  
    const handleDragCancel = () => {
      setActiveId(null);
    };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Achievements</h2>
      
      {/* Existing achievements */}
      {data.length > 0 && (
        <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        >
        <SortableContext 
        items={data.map(ach => ach.title)} 
        strategy={verticalListSortingStrategy}
        >
        <div className="mb-6 space-y-4">
          {data.map((ach, index) => (
            <SortableItem key={ach.title} id={ach.title} className=" border border-gray-200 rounded p-4">
             <div className="flex justify-between items-center w-full">
              <div className="flex flex-col">
                <h3 className="font-medium">{ach.title}</h3>
                {ach.date && <p className="text-sm text-gray-600">{new Date(ach.date).toLocaleDateString()}</p>}
              </div>
              <button
                onClick={() => handleRemoveAchievement(index)}
                className="text-red-500 hover:text-red-700"
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
              {data.find(ach => ach.title === activeId)?.title}
              </h3>
            </div>
          ) : null}
        </DragOverlay>
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