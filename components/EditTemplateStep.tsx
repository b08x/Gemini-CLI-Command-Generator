
import React, { useState, useEffect } from 'react';
import { Template } from '../types';
import CodeEditor from './CodeEditor';
import Icon from './Icon';

interface EditTemplateStepProps {
  template: Template;
  onUpdate: (updatedTemplate: Template) => void;
  onCancel: () => void;
  existingTemplates: Template[];
}

const EditTemplateStep: React.FC<EditTemplateStepProps> = ({ template, onUpdate, onCancel, existingTemplates }) => {
  const [name, setName] = useState(template.name);
  const [description, setDescription] = useState(template.description);
  const [toml, setToml] = useState(template.toml);
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    setName(template.name);
    setDescription(template.description);
    setToml(template.toml);
  }, [template]);

  const handleNameChange = (newName: string) => {
    setName(newName);
    const isDuplicate = existingTemplates.some(
      t => t.id !== template.id && t.name.trim().toLowerCase() === newName.trim().toLowerCase()
    );
    if (isDuplicate) {
      setNameError('A template with this name already exists.');
    } else {
      setNameError(null);
    }
  };
  
  const handleSave = () => {
    if (name.trim() && description.trim() && toml.trim() && !nameError) {
      onUpdate({
        ...template,
        name: name.trim(),
        description: description.trim(),
        toml: toml.trim()
      });
    }
  };

  const isSaveDisabled = !name.trim() || !description.trim() || !toml.trim() || !!nameError;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#e2a32d]">Edit Template</h2>
          <p className="text-[#95aac0] mt-1">Modify the details of your saved command template.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="template-name" className="block text-sm font-medium text-gray-300 mb-2">Template Name</label>
          <input
            id="template-name"
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className={`w-full p-3 bg-[#212934] border rounded-lg outline-none placeholder:text-[#95aac0] transition-all ${nameError ? 'border-red-500 ring-1 ring-red-500/50' : 'border-[#5c6f7e] focus:ring-2 focus:ring-[#e2a32d]'}`}
          />
          {nameError && <p className="text-red-400 text-sm mt-2">{nameError}</p>}
        </div>
        <div>
          <label htmlFor="template-desc" className="block text-sm font-medium text-gray-300 mb-2">Description</label>
          <input
            id="template-desc"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 bg-[#212934] border border-[#5c6f7e] rounded-lg outline-none focus:ring-2 focus:ring-[#e2a32d] placeholder:text-[#95aac0]"
          />
        </div>
      </div>
      
      <div className="flex flex-col">
          <label htmlFor="template-toml" className="block text-sm font-medium text-gray-300 mb-2">TOML Content</label>
          <CodeEditor value={toml} onChange={setToml} />
      </div>

      <div className="flex justify-between items-center mt-4">
        <button onClick={onCancel} className="px-6 py-2 bg-[#333e48] text-gray-200 font-semibold rounded-lg border border-[#5c6f7e] hover:bg-[#5c6f7e] transition-all">
          Cancel
        </button>
        <button onClick={handleSave} disabled={isSaveDisabled} className="px-6 py-2 bg-[#c36e26] text-white font-semibold rounded-lg hover:bg-[#b56524] disabled:bg-[#5c6f7e] disabled:cursor-not-allowed transition-all">
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default EditTemplateStep;