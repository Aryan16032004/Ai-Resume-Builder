// components/Resume/SkillsForm.jsx
import React, { useState } from 'react';

function SkillsForm({ data, updateData }) {

   const [skills, setSkills] = useState({
    languages: data.languages || [],
    frameworks: data.frameworks || [],
    toolsplatforms: data.toolsplatforms || [],
    softSkills: data.softSkills || []
  });

  const [newSkill, setNewSkill] = useState('');
  const [skillCategory, setSkillCategory] = useState('languages');

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      const updatedSkills = {
        ...skills,
        [skillCategory]: [...skills[skillCategory], newSkill.trim()]
      };
      setSkills(updatedSkills);
      updateData(updatedSkills);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (category, index) => {
    const updatedSkills = {
      ...skills,
      [category]: skills[category].filter((_, i) => i !== index)
    };
    setSkills(updatedSkills);
    updateData(updatedSkills); 
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Skills</h2>
      <div className="space-y-4">
        <div className="flex gap-2">
          <select
            value={skillCategory}
            onChange={(e) => setSkillCategory(e.target.value)}
            className="border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="languages">Programming Languages</option>
            <option value="frameworks">Frameworks</option>
            <option value="toolsplatforms">Tools/Platforms</option>
            <option value="softSkills">Soft Skills</option>
          </select>
          
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Add new skill"
            className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          
          <button
            onClick={handleAddSkill}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add
          </button>
        </div>
        
        {/* Display skills by category */}
        {Object.entries(data).map(([category, skills]) => (
          <div key={category} className="border border-gray-200 rounded p-4">
            <h3 className="font-medium capitalize">{category.replace(/([A-Z])/g, ' $1')}</h3>
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {skills.map((skill, index) => (
                  <span key={index} className="inline-flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
                    {skill}
                    <button
                      onClick={() => handleRemoveSkill(category, index)}
                      className="ml-2 text-gray-500 hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm mt-1">No skills added yet</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SkillsForm;