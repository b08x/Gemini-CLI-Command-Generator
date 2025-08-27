
import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import { Template } from '../types';
import { generateTemplateDescription } from '../services/geminiService';

interface SaveTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description: string) => void;
  templates: Template[];
  tomlContent: string;
}

const SaveTemplateModal: React.FC<SaveTemplateModalProps> = ({ isOpen, onClose, onSave, templates, tomlContent }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset fields when opening
      setName('');
      setDescription('');
      setError(null);

      // Generate description
      setIsGeneratingDesc(true);
      generateTemplateDescription(tomlContent).then(generatedDesc => {
        setDescription(generatedDesc);
        setIsGeneratingDesc(false);
      });
    }
  }, [isOpen, tomlContent]);

  if (!isOpen) {
    return null;
  }

  const handleNameChange = (newName: string) => {
    setName(newName);
    if (templates.some(t => t.name.trim().toLowerCase() === newName.trim().toLowerCase())) {
      setError('A template with this name already exists. Please choose a different name.');
    } else {
      setError(null);
    }
  };

  const handleSave = () => {
    if (name.trim() && description.trim() && !error && !isGeneratingDesc) {
      onSave(name.trim(), description.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-[#333e48] rounded-xl border border-[#5c6f7e] shadow-2xl w-full max-w-lg p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#e2a32d]">Save as Template</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-[#5c6f7e]">
            <Icon path="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" className="w-6 h-6 text-gray-400" />
          </button>
        </div>
        <div className="flex flex-col gap-5">
          <div>
            <label htmlFor="template-name" className="block text-sm font-medium text-gray-300 mb-2">Template Name</label>
            <input
              id="template-name"
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g., Git Commit Summarizer"
              className={`w-full p-3 bg-[#212934] border rounded-lg outline-none placeholder:text-[#95aac0] transition-all ${error ? 'border-red-500 ring-1 ring-red-500/50' : 'border-[#5c6f7e] focus:ring-2 focus:ring-[#e2a32d]'}`}
            />
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>
           <div>
            <label htmlFor="template-desc" className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              id="template-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isGeneratingDesc ? "Generating AI description..." : "A short description of what this command template does."}
              className="w-full h-24 p-3 bg-[#212934] border border-[#5c6f7e] rounded-lg outline-none focus:ring-2 focus:ring-[#e2a32d] placeholder:text-[#95aac0] resize-y"
              disabled={isGeneratingDesc}
            />
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-8">
          <button onClick={onClose} className="px-6 py-2 bg-[#5c6f7e] text-white font-semibold rounded-lg hover:bg-[#95aac0] transition-all">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || !description.trim() || !!error || isGeneratingDesc}
            className="px-6 py-2 bg-[#c36e26] text-white font-semibold rounded-lg hover:bg-[#b56524] disabled:bg-[#5c6f7e] disabled:cursor-not-allowed transition-all"
          >
            Save Template
          </button>
        </div>
      </div>
    </div>
  );
};
export default SaveTemplateModal;
