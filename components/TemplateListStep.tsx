
import React from 'react';
import { Template } from '../types';
import Icon from './Icon';

interface TemplateListStepProps {
  templates: Template[];
  onSelectTemplate: (templateId: string) => void;
  onEditTemplate: (templateId: string) => void;
  onDeleteTemplate: (templateId: string) => void;
  onNewTemplate: () => void;
  onBack: () => void;
}

const TemplateListStep: React.FC<TemplateListStepProps> = ({ templates, onSelectTemplate, onEditTemplate, onDeleteTemplate, onNewTemplate, onBack }) => {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#e2a32d]">Select a Template</h2>
          <p className="text-[#95aac0] mt-1">Choose a base command to generate a variant from, or create a new one from scratch.</p>
        </div>
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="px-6 py-2 bg-[#333e48] text-gray-200 font-semibold rounded-lg border border-[#5c6f7e] hover:bg-[#5c6f7e] transition-all">
              Back
            </button>
            <button onClick={onNewTemplate} className="flex items-center gap-2 px-6 py-2 bg-[#c36e26] text-white font-semibold rounded-lg hover:bg-[#b56524] transition-all">
                <Icon path="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" className="w-5 h-5" />
                Create New Template
            </button>
        </div>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-16 bg-[#212934] rounded-lg border border-dashed border-[#5c6f7e]">
          <Icon path="M13 13h-2v-2h2v2zm0-4h-2V5h2v4zM18 2H6c-1.1 0-2 .9-2 2v16h16V4c0-1.1-.9-2-2-2zM8 6h10v2H8V6zm10 8H8v-2h10v2zm-2-4H8v-2h8v2z" className="w-16 h-16 text-[#5c6f7e] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-200">No Templates Found</h3>
          <p className="text-[#95aac0] mt-2">Create a new template or save a generated command to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="group flex flex-col bg-[#212934] rounded-lg border border-[#5c6f7e] hover:border-[#e2a32d] transition-colors">
               <div className="p-6 flex-grow">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-gray-200 truncate pr-2">{template.name}</h3>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button
                          onClick={() => onEditTemplate(template.id)}
                          className="p-1.5 rounded-md hover:bg-[#5c6f7e]"
                          aria-label={`Edit ${template.name}`}
                        >
                            <Icon path="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" className="w-5 h-5 text-gray-300"/>
                        </button>
                        <button
                          onClick={() => onDeleteTemplate(template.id)}
                          className="p-1.5 rounded-md hover:bg-red-800/60"
                           aria-label={`Delete ${template.name}`}
                        >
                            <Icon path="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" className="w-5 h-5 text-red-300"/>
                        </button>
                    </div>
                </div>
                <p className="text-sm text-[#95aac0] mt-2 h-20 overflow-hidden text-ellipsis">{template.description}</p>
              </div>
              <div className="p-4 bg-[#333e48] border-t border-[#5c6f7e] rounded-b-lg">
                <button onClick={() => onSelectTemplate(template.id)} className="w-full px-4 py-2 bg-[#c36e26] text-white font-semibold rounded-lg hover:bg-[#b56524] transition-all">
                  Select & Continue
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TemplateListStep;